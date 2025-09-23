import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js';
import FormData from "form-data";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

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

    const aiResponse = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: length
    });

    const content = aiResponse.choices[0].message.content;

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

    res.json({ success: true, content });
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

    const aiResponse = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 100
    });

    const content = aiResponse.choices[0].message.content;

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

    res.json({ success: true, content });
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
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth() || {}; // ✅ fixed
    const { image } = req.file;
    const { object } = req.body;
    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path)
    const imageUrl = cloudinary.url(public_id,{
      transformation: [{effect:`gen_remove:${object}`}],
      resource_type:'image'
    })

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
    
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth(); // ✅ fixed
    const { resume } = req.file;
    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;

    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }

    if(resume.size > 5 * 1024 * 1024){
      return res.json({success:false, message:"Resume file size exceeds allowed size (5MB)."})
    }

    const dataBuffer = fs.readFileSync(resume.path)
    const pdfData = await pdf(dataBuffer)
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weakness, and the areas for improvement. Also, create an updated resume. Resume Content: \n\n${pdfData.text}`
        const aiResponse = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 2000
    });

    const content = aiResponse.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content: content });
    
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
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
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 2000
    });

    // Defensive check
    const content = aiResponse.choices[0]?.message?.content;
    if (!content) {
      return res.json({ success: false, message: "AI returned empty response" });
    }

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

    return res.json({ success: true, content });
  } catch (error) {
    console.error("Prescription error:", error);
    return res.json({ success: false, message: error.message || "Server Error" });
  }
};

export const generateStudyContent = async (req, res) => {
  try {
    const { userId } = req.auth(); // Clerk user ID
    const { input, mode, topic } = req.body;

    // const user = await clerkClient.users.getUser(userId);
    const plan = req.plan;

    // Free usage limit
    if (plan !== 'premium') {
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }

    // Build AI prompt
    let prompt = "";

    if (mode === "Q&A") {
      prompt = `
        Generate 25 practice questions (different difficulty levels) 
        for the topic: "${input}".
        Format them as a bullet list.
      `;
    } else if (mode === "Flashcards") {
      prompt = `
        Generate 5 flashcards for the topic: "${input}".
        Format them as "Q: ... | A: ...".
      `;
    } else if (mode === "Summarizer") {
      prompt = `
        Summarize the following notes into a concise explanation: "${input}".
      `;
    }

    // If YouTube topic entered
    if (topic) {
      prompt += `
        Also suggest 5 best YouTube channels for learning "${topic}".
        Format them as bullet points.
      `;
    }

    const aiResponse = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 500
    });

    const content = aiResponse.choices[0].message.content;

    // Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, ${prompt}, ${content}, 'study-content')
    `;

    // Track free usage
    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};


// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: "GEMINI_API_KEY",
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

// async function main() {
//   const image = await openai.images.generate(
//     {
//       model: "imagen-3.0-generate-002",
//       prompt: "a portrait of a sheepadoodle wearing a cape",
//       response_format: "b64_json",
//       n: 1,
//     }
//   );

//   console.log(image.data);
// }

// main();