"use client";

import Loader from "@/components/loader";
import { cn } from "@/lib/utils";
import React from "react";

type BillingPeriod = "monthly" | "yearly";

const plans = [
    {
        id: "starter",
        name: "Starter",
        description:
            "Perfect for freelancers, design studios and solo consultants.",
        monthly: 49,
        yearly: 39,
        features: [
            "Up to 10 active clients",
            "Custom portal",
            "Client onboarding workflows",
            "File sharing",
            "Document requests",
            "Customer support",
        ],
        cta: "Start 7-day free trial",
    },
    {
        id: "premium",
        name: "Premium",
        description:
            "Built for agencies and teams managing clients at scale.",
        monthly: 99,
        yearly: 79,
        features: [
            "Unlimited clients",
            "Custom branded portal",
            "Client onboarding workflows",
            "File sharing",
            "Document requests",
            "Priority support",
        ],
        cta: "Start 7-day free trial",
        popular: true,
    },
];

export default function PlansPage() {
    
    const [billingPeriod, setBillingPeriod] =
        React.useState<BillingPeriod>("monthly");
    return (
        <main className="min-h-screen w-full flex items-center justify-center">
            <div className="w-full max-w-5xl px-4 md:px-6 py-16 md:pt-15">
                {/* Heading */}
                <div className="text-center mb-8 md:mb-10">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900">
                        Select a plan and start your 7-day free trial
                    </h1>
                </div>

                {/* Billing toggle pill */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 px-1 py-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setBillingPeriod("monthly")}
                            className={`flex items-center rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${billingPeriod === "monthly"
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                                }`}
                        >
                            Monthly
                        </button>

                        <button
                            type="button"
                            onClick={() => setBillingPeriod("yearly")}
                            className={`flex items-center rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${billingPeriod === "yearly"
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                                }`}
                        >
                            <span>Yearly</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${billingPeriod === "yearly"
                                    ? " text-[#05C168]"
                                    : " text-[#05C168]"
                                    }`}
                            >
                                -20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Cards row */}
                <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8">
                    {plans.map((plan) => {
                        const price =
                            billingPeriod === "monthly" ? plan.monthly : plan.yearly;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative flex w-full max-w-xs flex-col rounded-[18px] border-[#F0F0F0] border-2 px-3 pb-7 pt-3 md:px-2 md:pb-8 md:pt-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl",
                                    plan.id === "premium" ? "bg-[#F1F1F1] border-white" : "bg-white border-[#F0F0F0]"
                                )}
                            >

                                {/* Title + description */}
                                <div className="mb-6 mx-1 bg-white p-5 rounded-[10] shadow-sm border-[#F0F0F0] border">
                                    {/* Popular badge */}
                                    {plan.popular && (
                                        <span className="absolute right-5 top-15 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-medium text-blue-700">
                                            Popular
                                        </span>
                                    )}
                                    <h2 className="text-3xl font-Inter font-semibold text-neutral-900">
                                        {plan.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {plan.description}
                                    </p>
                                </div>


                                <div className="px-6 ">

                                    {/* Price */}
                                    <div className="mb-6 flex items-end gap-1 text-text-dark">
                                        <span className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
                                            ${price}
                                        </span>
                                        <span className="mb-1 text-sm text-neutral-500">
                                            / month
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="mb-5 h-px w-full bg-neutral-200" />

                                    {/* Features */}
                                    <ul className="mb-6 space-y-3 text-sm text-neutral-700">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-neutral-900">
                                                    <svg
                                                        viewBox="0 0 16 16"
                                                        aria-hidden="true"
                                                        className="h-3 w-3 text-white"
                                                    >
                                                        <path
                                                            d="M12.736 4.293a1 1 0 0 1 .027 1.414l-5.01 5.2a1 1 0 0 1-1.45.012L3.237 7.743A1 1 0 1 1 4.68 6.3l1.86 1.9 4.3-4.464a1 1 0 0 1 1.414-.027Z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                </span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {/* Divider */}
                                    <div className="mb-5 h-px w-full bg-neutral-200" />

                                </div>
                                {/* CTA */}
                                <button
                                    type="button"
                                    className="mx-5 px-3 py-1.5 bg-button-dark shadow-btn text-white font-Inter rounded-[8] border border-[#5E6371]"
                                >
                                    {plan.cta}
                                </button>

                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
