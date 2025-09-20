import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth || {}; // ✅ fixed
    const { prompt, length } = req.body;
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
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

    if (plan !== "premium") {
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
    const { userId } = req.auth || {}; // ✅ fixed
    const { prompt } = req.body;
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
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

    if (plan !== "premium") {
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
    const { userId } = req.auth || {}; // ✅ fixed
    const { prompt, publish } = req.body;
    const user = await clerkClient.users.getUser(userId);
    const plan = (user.privateMetadata.plan || "").toLowerCase();

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }

    const formData = new FormData()
    formData.append('prompt', prompt)
    const {data} = await axios.post("https://api.freepik.com/v1/ai/mystic", formData, {
        headers: {'x-api-key': process.env.FREEPIK_API_KEY},
        responseType: "arraybuffer",
    })

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`
    const {secure_url} = await cloudinary.uploader.upload(base64Image)

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
    const { userId } = req.auth || {}; // ✅ fixed
    const {image} = req.file;
    const user = await clerkClient.users.getUser(userId);
    const plan = (user.privateMetadata.plan || "").toLowerCase();

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is available for premium users!"
      });
    }

    const {secure_url} = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal:'remove_the_background'
        }
      ]
    })

    await sql`
      INSERT INTO creations (user_id, prompt, content, type) 
      VALUES (${userId}, 'Remove backkground from the image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth || {}; // ✅ fixed
    const { image } = req.file;
    const { object } = req.body;
    const user = await clerkClient.users.getUser(userId);
    const plan = (user.privateMetadata.plan || "").toLowerCase();

    if (plan !== "premium") {
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
    const { userId } = req.auth || {}; // ✅ fixed
    const { resume } = req.file;
    const user = await clerkClient.users.getUser(userId);
    const plan = (user.privateMetadata.plan || "").toLowerCase();

    if (plan !== "premium") {
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
    const { userId } = req.auth || {}; // Clerk user ID
    const { firstName, lastName, age, gender, location, healthIssue, responseStyle } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    // Limit check for free users
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium to continue."
      });
    }

    // Build AI prompt
    const prompt = `
      Patient Details:
      - Name: ${firstName} ${lastName}
      - Age: ${age}
      - Gender: ${gender}
      - Location: ${location}

      Reported Issue:
      ${healthIssue}

      Please provide a ${responseStyle} medical-style prescription.
      Include possible causes, recommendations for how to recover and make the health better, and next steps in a safe, helpful tone, also show the complete details of doctors available nearby at mentioned ${location} as per the reported issue ${healthIssue}.
    `;

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
      VALUES (${userId}, ${prompt}, ${content}, 'prescription')
    `;

    // Update free usage if not premium
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1
        }
      });
    }

    res.json({ success: true, prescription: content });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateStudyContent = async (req, res) => {
  try {
    const { userId } = req.auth || {}; // Clerk user ID
    const { input, mode, topic } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    // Free usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit reached. Upgrade to premium to continue."
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
    if (plan !== "premium") {
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