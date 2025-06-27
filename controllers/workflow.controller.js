import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import { Receiver } from "@upstash/qstash";
import Subscription from "../models/subscription.model.js";
import {QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY} from "../configs/env.js";
import {sendReminderEmail} from "../utils/send-email.js";
// import { sendReminderEmail } from "../utils/send-email.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
    // Receive work client claims & convert req.body -> context.payload => return a callback(err, req, res)
    console.log("Receive work client claims & convert req.body -> context.payload => return a callback(err, req, res)");
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);
    console.log("subscriptionId: ", subscriptionId)
    if (!subscription || subscription.status !== "active") return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(
            `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`
        );
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, "day");

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(
                context,
                `Reminder ${daysBefore} days before`,
                reminderDate
            );
        }

        if (dayjs().isSame(reminderDate, "day")) {
            await triggerReminder(
                context,
                `${daysBefore} days before reminder`,
                subscription
            );
        }
    }
},
    {
    receiver: new Receiver({
        currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
        nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
    }),
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run("get subscription", async () => { // log what action to upstash server
        return Subscription.findById(subscriptionId).populate("user", "name email");
    });
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        });
    });
};
