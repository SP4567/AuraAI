import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import FormData from "form-data";
import pdf from 'pdf-parse';

const AI = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || process.env.NEMOTRON_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || process.env.NEMOTRON_BASE_URL || "https://integrate.api.nvidia.com/v1"
});

const NEMOTRON_MODEL = process.env.NEMOTRON_MODEL || "nvidia/nemotron-3.5-super-vl-120b-a12b";

/**
 * Extracts pure, final user-facing content from NVIDIA Nemotron completions,
 * prevents leaking raw internal chain-of-thought (reasoning_content), and formats token usage.
 */
const extractAiOutput = (aiResponse, fallbackMessage = "AI service did not return content.") => {
  const choice = aiResponse?.choices?.[0];
  const msg = choice?.message;
  let content = msg?.content || "";

  // Strip any <think> or <thought> tags if model emitted them in content
  if (typeof content === "string") {
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    content = content.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();
  }

  // If content is empty because reasoning consumed the entire token limit
  if (!content) {
    if (choice?.finish_reason === "length") {
      console.warn("⚠️ Token budget was exhausted during reasoning phase.");
      throw new Error("Generation reached token limit during reasoning. Please try with a more focused prompt.");
    }
    // If finish_reason was stop but content was somehow in reasoning_content
    if (msg?.reasoning_content) {
      console.warn("⚠️ Content was empty; using trimmed reasoning_content as fallback.");
      content = msg.reasoning_content.trim();
    }
  }

  if (!content) {
    throw new Error(fallbackMessage);
  }

  const usage = aiResponse?.usage ? {
    prompt_tokens: aiResponse.usage.prompt_tokens || 0,
    completion_tokens: aiResponse.usage.completion_tokens || 0,
    total_tokens: aiResponse.usage.total_tokens || 0,
    reasoning_tokens: aiResponse.usage.completion_tokens_details?.reasoning_tokens || 0
  } : null;

  return { content, usage };
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth(); // ✅ fixed
    const { prompt, length } = req.body;
    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue"
      });
    }

    // Provide generous token budget so Nemotron's internal reasoning (~800-1200 tokens)
    // does not starve or cut off the actual finished article
    const targetLengthTokens = Math.max(Number(length) || 1200, 1000);
    const maxTokensBudget = targetLengthTokens + 2500;

    const aiResponse = await AI.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional article writer and editor. Output only the finished, publication-ready article directly in clean Markdown format with headers and sections. Do not include internal planning outlines, meta-commentary, or chain-of-thought in your final output."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokensBudget
    });

    const { content, usage } = extractAiOutput(aiResponse, "Failed to generate article content.");

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, content, usage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth(); // ✅ fixed
    const { prompt } = req.body;
    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue"
      });
    }

    // Increase budget from 150 to 2048 to prevent reasoning from exhausting the token limit
    const aiResponse = await AI.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter. Generate catchy, high-CTR blog titles formatted directly as a numbered Markdown list. Output the titles directly without internal scratchpad planning or meta-commentary."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const { content, usage } = extractAiOutput(aiResponse, "Failed to generate blog titles.");

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, content, usage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body; // include style
    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;

    // Only premium users allowed
    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is available for premium users only!"
      })
    }

    // Combine prompt + style

    const formData = new FormData();
    formData.append('prompt', prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish) 
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const removeImageBackground = async (req, res) => {
  try {
    console.log('🎬 REMOVE BACKGROUND FUNCTION CALLED');
    
    const { userId } = req.auth();
    console.log('👤 User ID:', userId);
    
    const plan = req.plan;
    console.log('📋 Plan:', plan);
    
    // Check premium status first
    if (plan !== 'premium') {
      console.log('❌ BLOCKING: Not premium user');
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }
    
    console.log('✅ Premium user confirmed');
    
    // Debug file information
    console.log('📁 req.file:', req.file);
    console.log('📁 req.files:', req.files);
    
    if (!req.file) {
      return res.json({
        success: false,
        message: "No image file uploaded. Please select an image."
      });
    }
    
    console.log('🖼️ File details:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination
    });
    
    let imageSource;
    
    // Handle different multer configurations
    if (req.file.path) {
      // Disk storage - use file path
      imageSource = req.file.path;
      console.log('📍 Using file path:', imageSource);
    } else if (req.file.buffer) {
      // Memory storage - use buffer as base64
      imageSource = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      console.log('💾 Using buffer as base64');
    } else {
      console.log('❌ No valid file path or buffer found');
      return res.json({
        success: false,
        message: "Invalid file upload. Please try again."
      });
    }
    
    console.log('☁️ Uploading to Cloudinary...');
    
    const { secure_url } = await cloudinary.uploader.upload(imageSource, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });
    
    console.log('✅ Cloudinary upload successful:', secure_url);
    
    // Save to database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;
    
    console.log('✅ Database insert successful');
    
    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error('💥 Error in removeImageBackground:', error);
    res.json({ success: false, message: error.message });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Cleaned up temporary upload:', req.file.path);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr.message);
      }
    }
  }
};

export const removeImageObject = async (req, res) => {
  try {
    console.log('🎬 REMOVE OBJECT FUNCTION CALLED');
    
    const { userId } = req.auth();
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({ success: false, message: "This feature is available for premium users!" });
    }

    if (!req.file) {
      return res.json({ success: false, message: "No image file uploaded. Please select an image." });
    }

    if (!object || object.trim() === '') {
      return res.json({ success: false, message: "Please specify what object to remove from the image." });
    }

    // Decide the image source
    let imageSource = req.file.path 
      ? req.file.path 
      : `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log('☁️ Uploading to Cloudinary...');

    // Upload without transformation first
    const uploadResult = await cloudinary.uploader.upload(imageSource, {
      resource_type: 'image',
      quality: 'auto',
      secure: true
    });

    const { public_id } = uploadResult;

    // Generate the transformed URL with e_gen_remove
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `e_gen_remove:${object.trim()}` }],
      secure: true
    });

    console.log('🔗 Generated transformation URL:', imageUrl);

    // Insert into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object.trim()} from image`}, ${imageUrl}, 'image')`;

    console.log('✅ Database insert successful');
    return res.json({ success: true, content: imageUrl });

  } catch (error) {
    console.error('💥 Error in removeImageObject:', error);
    return res.json({
      success: false,
      message: error.message.includes('Invalid transformation') 
        ? "The specified object couldn't be removed. Try being more specific." 
        : "Image processing failed. Please try again."
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🧹 Cleaned up temporary upload:', req.file.path);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr.message);
      }
    }
  }
};
export const reviewResume = async (req, res) => {
  console.log('=== RESUME REVIEW START ===');
  
  try {
    // Step 1: Check if multer processed the file
    console.log('1. Checking multer file processing...');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    
    if (!req.file) {
      console.log('❌ No file received by multer');
      return res.json({
        success: false,
        message: "No resume file uploaded. Multer did not process the file."
      });
    }
    
    console.log('✅ File received by multer:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Step 2: Auth check
    console.log('2. Checking authentication...');
    let userId;
    try {
      const auth = req.auth();
      userId = auth.userId;
      console.log('✅ Auth successful, User ID:', userId);
    } catch (authError) {
      console.log('❌ Auth failed:', authError.message);
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({
        success: false,
        message: "Authentication failed"
      });
    }

    // Step 3: Plan check (comment this out if you want to skip premium check for testing)
    console.log('3. Checking user plan...');
    const plan = req.plan;
    console.log('User plan:', plan);
    
    if (plan !== 'premium') {
      console.log('❌ User not premium');
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({
        success: false,
        message: "This feature is available for premium users only!"
      });
    }

    // Step 4: File size check
    console.log('4. Checking file size...');
    if (req.file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', req.file.size);
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({
        success: false,
        message: "Resume file size exceeds 5MB limit."
      });
    }

    // Step 5: Check if file exists on disk
    console.log('5. Checking if file exists on disk...');
    if (!fs.existsSync(req.file.path)) {
      console.log('❌ File does not exist at path:', req.file.path);
      return res.json({
        success: false,
        message: "Uploaded file not found on server"
      });
    }
    console.log('✅ File exists on disk');

    // Step 6: Read and parse PDF
    console.log('6. Reading and parsing PDF...');
    let pdfText; // Declare pdfText in the outer scope
    
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      console.log('✅ File read successfully, buffer size:', dataBuffer.length);
      
      const pdfData = await pdf(dataBuffer);
      console.log('✅ PDF parsed successfully, text length:', pdfData.text.length);
      
      // Clean up uploaded file immediately after reading
      fs.unlinkSync(req.file.path);
      console.log('✅ Temporary file cleaned up');

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        console.log('❌ No text extracted from PDF');
        return res.json({
          success: false,
          message: "Could not extract text from the PDF. Please ensure it contains readable text."
        });
      }

      // Store the text in the outer scope variable
      pdfText = pdfData.text;
      console.log('PDF text preview:', pdfText.substring(0, 200) + '...');
      
    } catch (pdfError) {
      console.log('❌ PDF processing failed:', pdfError.message);
      // Clean up file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({
        success: false,
        message: "Failed to process PDF file. Please ensure it's a valid PDF."
      });
    }

    // Step 7: AI processing
    console.log('7. Processing with AI...');
    try {
      const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Also, create an updated resume.

Resume Content:

${pdfText}`;

      const aiResponse = await AI.chat.completions.create({
        model: NEMOTRON_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an executive talent recruiter and resume auditor. Provide a structured, comprehensive evaluation covering strengths, critical gaps, ATS optimization tips, and an updated section rewrite in clean Markdown without internal planning notes."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 5000
      });

      const { content, usage } = extractAiOutput(aiResponse, "Failed to analyze resume.");
      console.log('✅ AI response received, length:', content.length);

      // Step 8: Save to database
      console.log('8. Saving to database...');
      await sql`
        INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;
      
      console.log('✅ Saved to database successfully');

      console.log('🎉 Resume review completed successfully!');
      return res.json({ 
        success: true, 
        content,
        usage
      });

    } catch (aiError) {
      console.log('❌ AI processing failed:', aiError.message);
      console.log('AI Error stack:', aiError.stack);
      return res.json({
        success: false,
        message: "Failed to process resume with AI. Please try again."
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error in reviewResume:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('✅ Cleaned up file after error');
      } catch (cleanupError) {
        console.error('❌ File cleanup error:', cleanupError.message);
      }
    }
    
    return res.json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};


export const generatePrescription = async (req, res) => {
  try {
    const { userId } = req.auth(); // Clerk user ID
    const { firstName, lastName, age, gender, location, healthIssue, responseStyle } = req.body;

    if (!firstName || !lastName || !age || !gender || !location || !healthIssue) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium to continue."
      });
    }

    const prompt = `
      Patient Details:
      - firstName: ${firstName} 
      - lastname: ${lastName}
      - Age: ${age}
      - Gender: ${gender}
      - Location: ${location}
      - Reported Issue: ${healthIssue}

      Please provide a ${responseStyle} medical-style prescription.
      Include possible causes, recommendations for recovery, lifestyle improvements, and next steps in a safe, helpful tone. 
      Also, show the details of doctors available nearby in ${location} for the issue: ${healthIssue}.
    `;

    const aiResponse = await AI.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: [
        {
          role: "system",
          content: "You are Clinica, an AI health wellness advisor. Output structured health observations, recovery guidance, and doctor directories in clean Markdown without internal meta-commentary."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const { content, usage } = extractAiOutput(aiResponse, "AI returned empty response");

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'prescription')
    `;

    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 }
      });
    }

    return res.json({ success: true, content, usage });
  } catch (error) {
    console.error("Prescription error:", error);
    return res.json({ success: false, message: error.message || "Server Error" });
  }
};

export const generateStudyContent = async (req, res) => {
  try {
    const { userId } = req.auth(); // Clerk user ID
    const { input, mode } = req.body;

    // Plan from middleware
    const plan = req.plan;

    // Restrict free users
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is available for premium users!",
      });
    }

    // Validate input
    if (!input || !input.trim()) {
      return res.status(400).json({
        success: false,
        message: "Input topic is required",
      });
    }

    // Build AI prompt based on mode
    let prompt = "";

    switch (mode) {
      case "Q&A":
        prompt = `Generate 25 practice questions (varied difficulty) for the topic: "${input}". Format as a bullet list.`;
        break;
      case "Flashcards":
        prompt = `Generate 5 flashcards for the topic: "${input}". Format them as "Q: ... | A: ...".`;
        break;
      case "Summarizer":
        prompt = `Summarize the following notes into a concise explanation: "${input}".`;
        break;
      default:
        prompt = `Generate helpful study material for: "${input}".`;
    }

    // Call Nemotron AI safely
    const aiResponse = await AI.chat.completions.create({
      model: NEMOTRON_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    // Check AI response structure
    const rawContent = aiResponse?.choices?.[0]?.message?.content || aiResponse?.choices?.[0]?.message?.reasoning_content;
    if (!rawContent) {
      return res.status(502).json({
        success: false,
        message: "AI service did not return content.",
      });
    }

    const content = rawContent.trim();

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'study-content')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while generating study content.",
    });
  }
};