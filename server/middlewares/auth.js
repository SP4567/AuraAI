import { clerkClient } from "@clerk/express";

//middleware to check the userid and has premium plan or not.
export const auth = async (req, res, next) => {
    try {
        const { userId, has } = await req.auth();
        const hasPremiumPlan = await has({ plan: 'premium' });
        
        // Set the plan first
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        
        // Only handle free usage for non-premium users
        if (!hasPremiumPlan) {
            const user = await clerkClient.users.getUser(userId);
            
            // If user has existing free_usage, use it; otherwise initialize to 0
            if (user.privateMetadata && user.privateMetadata.free_usage !== undefined) {
                req.free_usage = user.privateMetadata.free_usage;
            } else {
                // Initialize free_usage for new free users
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user.privateMetadata, // Preserve other metadata
                        free_usage: 0
                    }
                });
                req.free_usage = 0;
            }
        } else {
            // Premium users don't need free_usage tracking
            req.free_usage = null;
        }
        
        console.log(`User ${userId}: Plan = ${req.plan}, Free Usage = ${req.free_usage}`); // Debug log
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.json({ success: false, message: error.message });
    }
};