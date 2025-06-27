import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../configs/upstash.js'
import { SERVER_URL } from '../configs/env.js'

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        console.log("I'm abcxyz claims, I'm calling/trigging to workflow of URL: ", `${SERVER_URL}/api/v1/workflows/subscription/reminder` );
        // I'm abcxyz claims, I'm calling/trigging to workflow of URL
        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id,
            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        })

        console.log("Over trigger workflow!")
        console.log("Receive for sub ID:", subscription.id, workflowRunId)

        res.status(201).json({ success: true, data: { subscription, workflowRunId } });
    } catch (e) {
        next(e);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Check if the user is the same as the one in the token
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
}