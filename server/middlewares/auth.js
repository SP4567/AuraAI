import { clerkClient } from "@clerk/express";

//middleware to check the userid and has premium plan or not.
export const auth = async (req, res, next) => {
    try {
        const authResult = await req.auth();
        console.log('🔍 AUTH RESULT:', authResult);
        
        const { userId, has } = authResult;
        console.log('👤 USER ID:', userId);
        console.log('🔧 HAS FUNCTION:', typeof has);
        
        // Get full user data to see what's available
        const user = await clerkClient.users.getUser(userId);
        console.log('📊 USER DATA:', JSON.stringify({
            id: user.id,
            publicMetadata: user.publicMetadata,
            privateMetadata: user.privateMetadata,
            subscriptions: user.publicMetadata?.subscriptions,
            plan: user.publicMetadata?.plan,
            // Add any other fields you think might contain plan info
        }, null, 2));
        
        // Try different ways to check for premium
        let hasPremiumPlan = false;
        
        try {
            // Method 1: Using has function with 'premium'
            hasPremiumPlan = await has({ plan: 'premium' });
            console.log('✅ Method 1 - has({plan: "premium"}):', hasPremiumPlan);
        } catch (error) {
            console.log('❌ Method 1 failed:', error.message);
        }
        
        try {
            // Method 2: Check public metadata
            const publicPlan = user.publicMetadata?.plan;
            console.log('📋 Method 2 - publicMetadata.plan:', publicPlan);
            if (publicPlan === 'premium') hasPremiumPlan = true;
        } catch (error) {
            console.log('❌ Method 2 failed:', error.message);
        }
        
        try {
            // Method 3: Check private metadata
            const privatePlan = user.privateMetadata?.plan;
            console.log('🔒 Method 3 - privateMetadata.plan:', privatePlan);
            if (privatePlan === 'premium') hasPremiumPlan = true;
        } catch (error) {
            console.log('❌ Method 3 failed:', error.message);
        }
        
        try {
            // Method 4: Try different has function calls
            const hasAlternatives = await Promise.allSettled([
                has({ plan: 'premium' }),
                has({ subscription: 'premium' }),
                has({ role: 'premium' }),
                has('premium'),
            ]);
            console.log('🔄 Method 4 - Alternative has() calls:', hasAlternatives.map((result, index) => ({
                method: ['plan:premium', 'subscription:premium', 'role:premium', 'direct:premium'][index],
                status: result.status,
                value: result.status === 'fulfilled' ? result.value : result.reason?.message
            })));
            
            // Use any successful premium check
            hasAlternatives.forEach((result) => {
                if (result.status === 'fulfilled' && result.value === true) {
                    hasPremiumPlan = true;
                }
            });
        } catch (error) {
            console.log('❌ Method 4 failed:', error.message);
        }
        
        console.log('🎯 FINAL PREMIUM STATUS:', hasPremiumPlan);
        
        // Set the plan
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        
        // Handle free usage for non-premium users
        if (!hasPremiumPlan) {
            if (user.privateMetadata && user.privateMetadata.free_usage !== undefined) {
                req.free_usage = user.privateMetadata.free_usage;
            } else {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: {
                        ...user.privateMetadata,
                        free_usage: 0
                    }
                });
                req.free_usage = 0;
            }
        } else {
            req.free_usage = null;
        }
        
        console.log('🚀 FINAL REQUEST DATA:', {
            userId,
            plan: req.plan,
            free_usage: req.free_usage
        });
        
        next();
    } catch (error) {
        console.error('💥 Auth middleware error:', error);
        res.json({ success: false, message: error.message });
    }
};