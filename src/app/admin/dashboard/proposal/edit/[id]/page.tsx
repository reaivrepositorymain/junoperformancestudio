"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MinusCircle } from "lucide-react";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";
import { Toaster, toast } from "sonner";

type ProposalFormValues = {
    title: string;
    client_name: string;
    overview: string;
    overview_details?: {
        title: string;
        description: string;
        items: { label: string; text: string }[];
    };
    hero: {
        headline: string;
        subtitle: string;
        highlights: ({ title: string; desc: string } | string)[];
    };
    solutions: {
        title: string;
        description?: string;
        bullets: string[];
        benefit?: string;
    }[];
    migration_process: {
        step: string;
        description: string;
    }[];
    timelines: {
        title: string;
        steps: { label: string; desc: string }[];
    }[];
    logo_base64?: string;
    pricing: {
        name: string;
        price: string;
        description: string;
        features: string[];
        highlighted: boolean;
    }[];
};

export default function EditProposalPage() {
    const router = useRouter();
    const params = useParams();
    const proposalId = params?.id as string;

    const [showPrice, setShowPrice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pricingTiers, setPricingTiers] = useState<ProposalFormValues["pricing"]>([]);

    // Add state to track the original title format
    const [originalTitle, setOriginalTitle] = useState("");

    // Add state for new pricing tier
    const [newPricingTier, setNewPricingTier] = useState({
        name: "",
        price: "",
        description: "One time payment",
        features: [""],
        highlighted: false
    });

    const form = useForm<ProposalFormValues>({
        defaultValues: {
            title: "",
            client_name: "",
            overview: "",
            overview_details: {
                title: "",
                description: "",
                items: [{ label: "", text: "" }],
            },
            hero: {
                headline: "",
                subtitle: "",
                highlights: [],
            },
            solutions: [],
            migration_process: [{ step: "", description: "" }],
            timelines: [{ title: "", steps: [{ label: "", desc: "" }] }],
            logo_base64: "",
            pricing: [],
        },
    });

    // Sync pricing tiers with react-hook-form
    useEffect(() => {
        form.setValue("pricing", pricingTiers);
    }, [pricingTiers, form]);

    // Add new pricing tier
    const handleAddPricingTier = () => {
        if (!newPricingTier.name.trim()) {
            toast.error("Pricing tier name is required.");
            return;
        }
        if (!newPricingTier.price.trim()) {
            toast.error("Price is required.");
            return;
        }
        if (newPricingTier.features.some(feature => !feature.trim())) {
            toast.error("All features must be filled.");
            return;
        }

        setPricingTiers(prev => [...prev, { ...newPricingTier }]);
        setNewPricingTier({
            name: "",
            price: "",
            description: "One time payment",
            features: [""],
            highlighted: false
        });
        toast.success("Pricing tier added successfully!");
    };

    // Remove pricing tier
    const removePricingTier = (idx: number) => {
        setPricingTiers(prev => prev.filter((_, i) => i !== idx));
    };

    // Handle new pricing tier changes
    const handleNewPricingTierChange = (field: keyof typeof newPricingTier, value: any) => {
        setNewPricingTier(prev => ({ ...prev, [field]: value }));
    };

    const handleNewFeatureChange = (idx: number, value: string) => {
        setNewPricingTier(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === idx ? value : f)
        }));
    };

    const addNewFeature = () => {
        setNewPricingTier(prev => ({ ...prev, features: [...prev.features, ""] }));
    };

    const removeNewFeature = (idx: number) => {
        setNewPricingTier(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== idx)
        }));
    };

    // Fetch proposal data and populate form
    useEffect(() => {
        const fetchProposal = async () => {
            setLoading(true);
            const res = await fetch(`/api/proposals/edit/${proposalId}`);
            console.log("Fetching proposal:", proposalId, "Status:", res.status);
            if (res.ok) {
                const { proposal } = await res.json();
                console.log("Fetched proposal data:", proposal);
                if (proposal) {
                    // Store the original title for later use
                    setOriginalTitle(proposal.title);

                    // Extract raw title from formatted title for display in form
                    let rawTitle = proposal.title;
                    const expectedPrefix = `Reaiv × ${proposal.client_name} | `;
                    if (rawTitle && rawTitle.startsWith(expectedPrefix)) {
                        rawTitle = rawTitle.replace(expectedPrefix, "");
                    }

                    // Process pricing data
                    const existingPricing = proposal.pricing || [];
                    setPricingTiers(existingPricing);

                    form.reset({
                        ...proposal,
                        title: rawTitle, // Use extracted raw title for form input
                        overview_details: proposal.overview_details || {
                            title: "",
                            description: "",
                            items: [{ label: "", text: "" }],
                        },
                        hero: proposal.hero || {
                            headline: "",
                            subtitle: "",
                            highlights: [],
                        },
                        solutions: proposal.solutions || [],
                        migration_process: proposal.migration_process || [{ step: "", description: "" }],
                        timelines: proposal.timelines || [{ title: "", steps: [{ label: "", desc: "" }] }],
                        logo_base64: proposal.logo_base64 || "",
                        pricing: existingPricing,
                    });
                    setShowPrice(existingPricing.length > 0);
                }
            } else {
                console.error("Failed to load proposal data. Status:", res.status);
                const errorData = await res.json().catch(() => ({}));
                console.error("Error response:", errorData);
                toast.error("Failed to load proposal data.");
            }
            setLoading(false);
        };

        fetchProposal();
    }, [proposalId, form]);

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch("/api/auth/check", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                toast.error("You must be logged in to access this page.");
                router.push("/auth/2.0/login");
            }
        };

        checkAuth();
    }, [router]);

    // Highlight logic
    const hero = form.watch("hero");
    const [newHighlight, setNewHighlight] = useState({ title: "", desc: "" });
    const highlights = Array.isArray(hero?.highlights) ? hero.highlights : [];

    const handleAddHighlight = () => {
        if (!newHighlight.title.trim()) {
            toast.error("Highlight title is required.");
            return;
        }
        if (!newHighlight.desc.trim()) {
            toast.error("Highlight description is required.");
            return;
        }
        if (highlights.length >= 3) {
            toast.error("Maximum of 3 highlights allowed.");
            return;
        }
        form.setValue("hero.highlights", [...highlights, { ...newHighlight }]);
        setNewHighlight({ title: "", desc: "" });
        toast.success("Highlight added!");
    };

    const handleRemoveHighlight = (idx: number) => {
        const newHighlights = highlights.filter((_, i) => i !== idx);
        form.setValue("hero.highlights", newHighlights);
    };

    const handleHighlightTitleChange = (idx: number, value: string) => {
        const newHighlights = highlights.map((h, i) => {
            if (i === idx) {
                if (typeof h === "string") {
                    return value;
                } else {
                    return { ...h, title: value };
                }
            }
            return h;
        });
        form.setValue("hero.highlights", newHighlights);
    };

    const handleHighlightDescChange = (idx: number, value: string) => {
        const newHighlights = highlights.map((h, i) => {
            if (i === idx) {
                if (typeof h === "string") {
                    return { title: h, desc: value };
                } else {
                    return { ...h, desc: value };
                }
            }
            return h;
        });
        form.setValue("hero.highlights", newHighlights);
    };

    // Fixed Solutions and Timeline logic
    const [solutions, setSolutions] = useState<ProposalFormValues["solutions"]>([]);
    const [timelines, setTimelines] = useState<
        { title: string; steps: { label: string; desc: string }[] }[]
    >([]);

    // Watch solutions changes and update timelines accordingly
    useEffect(() => {
        const currentSolutions = form.watch("solutions") || [];
        setSolutions(currentSolutions);

        // Only auto-generate timelines if they don't exist yet or need updating
        const currentTimelines = form.watch("timelines") || [];

        if (currentSolutions.length > 0) {
            // Create or update timelines based on solutions
            const updatedTimelines = currentSolutions.map((sol, idx) => {
                const existingTimeline = currentTimelines[idx];
                return {
                    title: existingTimeline?.title || sol.title || `Timeline ${idx + 1}`,
                    steps: existingTimeline?.steps?.length > 0
                        ? existingTimeline.steps
                        : [{ label: sol.title || "", desc: "" }]
                };
            });

            setTimelines(updatedTimelines);
            form.setValue("timelines", updatedTimelines);
        } else {
            // Clear timelines if no solutions
            setTimelines([]);
            form.setValue("timelines", []);
        }
    }, [form.watch("solutions")]);

    // Separate effect to sync timelines state with form when data is loaded
    useEffect(() => {
        const currentTimelines = form.watch("timelines") || [];
        if (JSON.stringify(currentTimelines) !== JSON.stringify(timelines)) {
            setTimelines(currentTimelines);
        }
    }, [form.watch("timelines")]);

    // Timeline handlers
    const updateTimelineTitle = (timelineIdx: number, title: string) => {
        const newTimelines = [...timelines];
        newTimelines[timelineIdx] = { ...newTimelines[timelineIdx], title };
        setTimelines(newTimelines);
        form.setValue("timelines", newTimelines);
    };

    const updateTimelineStep = (timelineIdx: number, stepIdx: number, field: 'label' | 'desc', value: string) => {
        const newTimelines = [...timelines];
        newTimelines[timelineIdx].steps[stepIdx] = {
            ...newTimelines[timelineIdx].steps[stepIdx],
            [field]: value
        };
        setTimelines(newTimelines);
        form.setValue("timelines", newTimelines);
    };

    const addTimelineStep = (timelineIdx: number) => {
        const newTimelines = [...timelines];
        newTimelines[timelineIdx].steps.push({ label: "", desc: "" });
        setTimelines(newTimelines);
        form.setValue("timelines", newTimelines);
    };

    const removeTimelineStep = (timelineIdx: number, stepIdx: number) => {
        const newTimelines = [...timelines];
        newTimelines[timelineIdx].steps = newTimelines[timelineIdx].steps.filter((_, i) => i !== stepIdx);
        setTimelines(newTimelines);
        form.setValue("timelines", newTimelines);
    };

    const [newSolution, setNewSolution] = useState({
        title: "",
        description: "",
        benefit: "",
        bullets: [""],
    });

    const handleAddSolution = () => {
        if (!newSolution.title.trim()) {
            toast.error("Solution title is required.");
            return;
        }
        if (!newSolution.description.trim()) {
            toast.error("Solution description is required.");
            return;
        }
        if (newSolution.bullets.some(bullet => !bullet.trim())) {
            toast.error("All bullet points must be filled.");
            return;
        }
        setSolutions(prev => [...prev, { ...newSolution }]);
        form.setValue("solutions", [...solutions, { ...newSolution }]);
        setNewSolution({ title: "", description: "", benefit: "", bullets: [""] });
        toast.success("Solution added successfully!");
    };

    const handleNewSolutionChange = (field: keyof typeof newSolution, value: string) => {
        setNewSolution(prev => ({ ...prev, [field]: value }));
    };

    const handleNewBulletChange = (idx: number, value: string) => {
        setNewSolution(prev => ({
            ...prev,
            bullets: prev.bullets.map((b, i) => i === idx ? value : b)
        }));
    };

    const addNewBullet = () => {
        setNewSolution(prev => ({ ...prev, bullets: [...prev.bullets, ""] }));
    };

    const removeNewBullet = (idx: number) => {
        setNewSolution(prev => ({
            ...prev,
            bullets: prev.bullets.filter((_, i) => i !== idx)
        }));
    };

    const removeSolution = (idx: number) => {
        const newSolutions = solutions.filter((_, i) => i !== idx);
        setSolutions(newSolutions);
        form.setValue("solutions", newSolutions);
    };

    const handleSubmit = async (data: ProposalFormValues) => {
        toast.dismiss();

        // Get the current form title value
        const currentFormTitle = data.title.trim();

        // Extract the raw title from the original stored title
        let originalRawTitle = originalTitle;
        const expectedPrefix = `Reaiv × ${data.client_name} | `;
        if (originalRawTitle && originalRawTitle.startsWith(expectedPrefix)) {
            originalRawTitle = originalRawTitle.replace(expectedPrefix, "");
        }

        // Determine which title to use
        let finalTitle;
        if (currentFormTitle === originalRawTitle || currentFormTitle === "") {
            // No change made to title, use original formatted title
            finalTitle = originalTitle;
        } else {
            // Title was changed, format the new title
            finalTitle = `Reaiv x ${data.client_name || "{client_name}"} | ${currentFormTitle || "{proposal_title}"}`;
        }

        const updatedFields = { ...data, title: finalTitle };

        try {
            // Fetch the current proposal data
            const currentRes = await fetch(`/api/proposals/edit/${proposalId}`);
            const currentData = currentRes.ok ? await currentRes.json() : {};

            // Merge current proposal with updated fields
            const payload = { ...currentData.proposal, ...updatedFields };

            const res = await fetch(`/api/proposals/edit/${proposalId}`, {
                method: "PUT",
                body: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                toast.success("Proposal updated successfully!");
                router.push("/admin/dashboard/proposal/listing");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to update proposal.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8CE232] mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading Proposal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
            <Toaster richColors position="top-center" />
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 shadow-xl border border-slate-200 bg-white rounded-2xl">
                    <h2 className="text-4xl tracking-tighter font-bold mb-6 text-center text-slate-900">Edit Proposal</h2>
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {/* Formatted Proposal Title Preview */}
                            <div className="mb-4 text-xl font-bold text-[#8CE232] text-center">
                                Reaiv × {form.watch("client_name") || "{client_name}"} | {form.watch("title") || "{proposal_title}"}
                            </div>

                            {/* Title */}
                            <FormItem>
                                <div className="flex items-center gap-1">
                                    <FormLabel className="text-md">Proposal Title</FormLabel>
                                    <span className="text-red-500 text-sm font-semibold">*</span>
                                </div>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...form.register("title", { required: true })}
                                        placeholder="Enter proposal title"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            {/* Client Name */}
                            <FormItem>
                                <div className="flex items-center gap-1">
                                    <FormLabel className="text-md">Client Name</FormLabel>
                                    <span className="text-red-500 text-sm font-semibold">*</span>
                                </div>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...form.register("client_name", { required: true })}
                                        placeholder="Enter client name"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            {/* Logo Upload */}
                            <div className="flex items-center gap-1">
                                <FormLabel className="text-md">Logo (Image)</FormLabel>
                                <span className="text-red-500 text-sm font-semibold">*</span>
                            </div>
                            <FormControl>
                                <div
                                    className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#8CE232] rounded-lg bg-white/80 p-6 cursor-pointer transition hover:border-[#6bbf1c]"
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const base64 = reader.result as string;
                                            form.setValue("logo_base64", base64);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                const base64 = reader.result as string;
                                                form.setValue("logo_base64", base64);
                                            };
                                            reader.readAsDataURL(file);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                    <div className="flex flex-col items-center justify-center pointer-events-none">
                                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#8CE232" strokeWidth="1.5" className="mb-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V8a2 2 0 012-2h14a2 2 0 012 2v8.5M3 16.5l4.5-4.5a2 2 0 012.8 0l2.2 2.2a2 2 0 002.8 0l4.5-4.5M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5" />
                                        </svg>
                                        <span className="text-[#8CE232] font-semibold">Browse or Drag & Drop</span>
                                        <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG, SVG up to 2MB</span>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />

                            {/* Logo Preview */}
                            {form.watch("logo_base64") && (
                                <div className="mt-4 flex flex-col items-center">
                                    <img
                                        src={form.watch("logo_base64")}
                                        alt="Logo Preview"
                                        className="max-h-32 rounded-lg border border-slate-200 shadow"
                                    />
                                    <span className="text-xs text-slate-500 mt-2">Logo Preview</span>
                                    <Button
                                        type="button"
                                        onClick={() => form.setValue("logo_base64", "")}
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-red-500 border-red-300 hover:bg-red-50"
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            )}

                            {/* Hero Section */}
                            <Card className="p-6 border border-slate-300 rounded-xl bg-white mb-8">
                                <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Hero Section</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormItem>
                                        <FormLabel>Headline</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...form.register("hero.headline")}
                                                placeholder="Hero headline"
                                                className="bg-white/80"
                                            />
                                        </FormControl>
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...form.register("hero.subtitle")}
                                                placeholder="Hero subtitle"
                                                className="bg-white/80"
                                            />
                                        </FormControl>
                                    </FormItem>
                                </div>

                                <div className="mt-6">
                                    <FormLabel className="mb-2 block">Add Highlight</FormLabel>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={newHighlight.title}
                                                    onChange={e => setNewHighlight(h => ({ ...h, title: e.target.value }))}
                                                    placeholder="Highlight title"
                                                    className="bg-white/80"
                                                    disabled={highlights.length >= 3}
                                                />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={newHighlight.desc}
                                                    onChange={e => setNewHighlight(h => ({ ...h, desc: e.target.value }))}
                                                    placeholder="Highlight description"
                                                    className="bg-white/80"
                                                    disabled={highlights.length >= 3}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    </div>
                                    <div className="text-right">
                                        <Button
                                            type="button"
                                            onClick={handleAddHighlight}
                                            className="bg-[#8CE232] text-black px-6 py-2 rounded-lg hover:bg-[#8CE232]/90 transition-colors"
                                            disabled={highlights.length >= 3}
                                        >
                                            Add Highlight
                                        </Button>
                                    </div>
                                    {highlights.length >= 3 && (
                                        <div className="text-xs text-red-500 mt-2">Maximum of 3 highlights allowed.</div>
                                    )}
                                </div>

                                {/* Highlights Table */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Highlights Added</h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 text-center">No.</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {highlights.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                                        No highlights added.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                highlights.map((h, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                                                        <TableCell>{typeof h === "string" ? h : h.title}</TableCell>
                                                        <TableCell>{typeof h === "string" ? "" : h.desc}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleRemoveHighlight(idx)}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:bg-red-100"
                                                                aria-label="Delete Highlight"
                                                            >
                                                                <Trash2 size={20} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            {/* Overview */}
                            <FormItem>
                                <div className="flex items-center gap-1">
                                    <FormLabel className="text-md">Overview</FormLabel>
                                    <span className="text-red-500 text-sm font-semibold">*</span>
                                </div>
                                <FormControl>
                                    <Textarea
                                        {...form.register("overview", { required: true })}
                                        placeholder="Write a brief overview of the proposal"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            {/* Solutions Section */}
                            <div className="mb-8">
                                <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                    <div className="flex items-center gap-1">
                                        <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Add Solution</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={newSolution.title}
                                                    onChange={e => handleNewSolutionChange("title", e.target.value)}
                                                    placeholder="Solution title"
                                                    className="bg-white/80"
                                                />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem>
                                            <FormLabel>Benefit</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={newSolution.benefit}
                                                    onChange={e => handleNewSolutionChange("benefit", e.target.value)}
                                                    placeholder="Benefit (optional)"
                                                    className="bg-white/80"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    </div>
                                    <FormItem className="mt-4">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                value={newSolution.description}
                                                onChange={e => handleNewSolutionChange("description", e.target.value)}
                                                placeholder="Describe the solution"
                                                className="bg-white/80"
                                            />
                                        </FormControl>
                                    </FormItem>
                                    <FormItem className="mt-4">
                                        <FormLabel>Bullets</FormLabel>
                                        <div className="space-y-2">
                                            {newSolution.bullets.map((bullet, bIdx) => (
                                                <div key={bIdx} className="flex gap-2 items-center">
                                                    <Input
                                                        type="text"
                                                        value={bullet}
                                                        onChange={e => handleNewBulletChange(bIdx, e.target.value)}
                                                        placeholder={`Bullet ${bIdx + 1}`}
                                                        className="bg-white/80"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeNewBullet(bIdx)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-400 hover:bg-red-100"
                                                        disabled={newSolution.bullets.length === 1}
                                                        aria-label="Remove Bullet"
                                                    >
                                                        <MinusCircle size={18} />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                onClick={addNewBullet}
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 flex gap-1 items-center bg-[#eaffd0] text-[#8CE232] border-[#8CE232] hover:bg-[#8CE232]/10"
                                            >
                                                <Plus size={16} />
                                                Add Bullet
                                            </Button>
                                        </div>
                                    </FormItem>
                                    <div className="mt-6 text-right">
                                        <Button
                                            type="button"
                                            onClick={handleAddSolution}
                                            className="bg-[#8CE232] text-black px-6 py-2 rounded-lg hover:bg-[#8CE232]/90 transition-colors"
                                        >
                                            Add Solution
                                        </Button>
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Solutions Table */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Solutions Added</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12 text-center">No.</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Benefit</TableHead>
                                                    <TableHead>Bullets</TableHead>
                                                    <TableHead className="text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {solutions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                                            No solutions created.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    solutions.map((sol, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                                                            <TableCell>{sol.title}</TableCell>
                                                            <TableCell>{sol.description}</TableCell>
                                                            <TableCell>{sol.benefit}</TableCell>
                                                            <TableCell>
                                                                <ul className="list-disc pl-4">
                                                                    {sol.bullets.map((b, bIdx) => (
                                                                        <li key={bIdx}>{b}</li>
                                                                    ))}
                                                                </ul>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => removeSolution(idx)}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-red-500 hover:bg-red-100"
                                                                    aria-label="Delete Solution"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>
                            </div>

                            <Separator className="my-6" />

                            {/* Migration Process */}
                            <div className="mb-8">
                                <div className="flex items-center gap-1">
                                    <FormLabel className="mb-2 block text-lg">Migration Process</FormLabel>
                                    <span className="text-red-500 text-sm font-semibold">*</span>
                                </div>
                                {[...Array(5)].map((_, idx) => (
                                    <Fragment key={idx}>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <FormItem>
                                                <FormLabel>Step {idx + 1} Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        {...form.register(`migration_process.${idx}.step`)}
                                                        placeholder={`Step ${idx + 1} name`}
                                                        className="bg-white/80"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel>Step {idx + 1} Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...form.register(`migration_process.${idx}.description`)}
                                                        placeholder={`Describe step ${idx + 1}`}
                                                        className="bg-white/80"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </div>
                                        {idx < 4 && <Separator className="my-2" />}
                                    </Fragment>
                                ))}
                            </div>

                            {/* Fixed Timelines Section */}
                            {solutions.length > 0 ? (
                                <div className="mb-8">
                                    <FormLabel className="mb-2 block text-md">Timelines</FormLabel>
                                    {timelines.map((timeline, timelineIdx) => (
                                        <Card key={timelineIdx} className="p-4 mb-4 border border-slate-200 rounded-xl bg-white/80">
                                            {/* Timeline Title */}
                                            <FormItem className="mb-4">
                                                <FormLabel>Timeline Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        value={timeline.title || ""}
                                                        onChange={e => updateTimelineTitle(timelineIdx, e.target.value)}
                                                        placeholder={`Timeline ${timelineIdx + 1} title`}
                                                        className="bg-white font-bold text-[#8CE232]"
                                                    />
                                                </FormControl>
                                            </FormItem>

                                            {/* Timeline Steps */}
                                            {timeline.steps.map((step, stepIdx) => (
                                                <div key={stepIdx} className="grid md:grid-cols-2 gap-4 mb-4 items-end">
                                                    <FormItem>
                                                        <FormLabel>Step {stepIdx + 1} Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                value={step.label || ""}
                                                                onChange={e => updateTimelineStep(timelineIdx, stepIdx, 'label', e.target.value)}
                                                                placeholder="Timeline step name"
                                                                className="bg-white"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                    <div className="flex items-end gap-2">
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Step {stepIdx + 1} Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    value={step.desc || ""}
                                                                    onChange={e => updateTimelineStep(timelineIdx, stepIdx, 'desc', e.target.value)}
                                                                    placeholder="Add timeline details"
                                                                    className="bg-white"
                                                                    rows={2}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-400 hover:bg-red-100"
                                                            disabled={timeline.steps.length === 1}
                                                            onClick={() => removeTimelineStep(timelineIdx, stepIdx)}
                                                            aria-label="Remove Step"
                                                        >
                                                            <MinusCircle size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Step Button */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 flex gap-1 items-center bg-[#eaffd0] text-[#8CE232] border-[#8CE232] hover:bg-[#8CE232]/10"
                                                onClick={() => addTimelineStep(timelineIdx)}
                                            >
                                                <Plus size={16} />
                                                Add Step to {timeline.title || `Timeline ${timelineIdx + 1}`}
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <FormLabel className="mb-2 block">Timelines</FormLabel>
                                    <div className="mb-8 text-center text-slate-500 p-6 border border-slate-200 rounded-xl bg-slate-50">
                                        No timelines available. Please add a solution first.
                                    </div>
                                </>
                            )}

                            {/* Toggle Price Section */}
                            <div className="mb-8 flex items-center gap-4">
                                <Switch
                                    checked={showPrice}
                                    onCheckedChange={setShowPrice}
                                    id="toggle-price"
                                />
                                <FormLabel htmlFor="toggle-price" className="text-md font-semibold">
                                    Include Pricing in Proposal
                                </FormLabel>
                            </div>

                            {/* Pricing Section */}
                            {showPrice && (
                                <div className="mb-8">
                                    <Card className="p-6 border border-slate-300 rounded-xl bg-white">
                                        <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Add Pricing Tier</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormItem>
                                                <FormLabel>Tier Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        value={newPricingTier.name}
                                                        onChange={e => handleNewPricingTierChange("name", e.target.value)}
                                                        placeholder="e.g., Basic, Premium, Enterprise"
                                                        className="bg-white/80"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        value={newPricingTier.price}
                                                        onChange={e => handleNewPricingTierChange("price", e.target.value)}
                                                        placeholder="e.g., ₱15,000"
                                                        className="bg-white/80"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </div>
                                        <FormItem className="mt-4">
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    value={newPricingTier.description}
                                                    onChange={e => handleNewPricingTierChange("description", e.target.value)}
                                                    placeholder="e.g., One time payment, Monthly subscription"
                                                    className="bg-white/80"
                                                />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem className="mt-4">
                                            <FormLabel>Features</FormLabel>
                                            <div className="space-y-2">
                                                {newPricingTier.features.map((feature, fIdx) => (
                                                    <div key={fIdx} className="flex gap-2 items-center">
                                                        <Input
                                                            type="text"
                                                            value={feature}
                                                            onChange={e => handleNewFeatureChange(fIdx, e.target.value)}
                                                            placeholder={`Feature ${fIdx + 1}`}
                                                            className="bg-white/80"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeNewFeature(fIdx)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-400 hover:bg-red-100"
                                                            disabled={newPricingTier.features.length === 1}
                                                            aria-label="Remove Feature"
                                                        >
                                                            <MinusCircle size={18} />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    onClick={addNewFeature}
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 flex gap-1 items-center bg-[#eaffd0] text-[#8CE232] border-[#8CE232] hover:bg-[#8CE232]/10"
                                                >
                                                    <Plus size={16} />
                                                    Add Feature
                                                </Button>
                                            </div>
                                        </FormItem>
                                        <div className="mt-4 flex items-center gap-2">
                                            <Switch
                                                checked={newPricingTier.highlighted}
                                                onCheckedChange={(checked) => handleNewPricingTierChange("highlighted", checked)}
                                                id="highlight-tier"
                                            />
                                            <FormLabel htmlFor="highlight-tier" className="text-sm">
                                                Highlight this tier (recommended/popular)
                                            </FormLabel>
                                        </div>
                                        <div className="mt-6 text-right">
                                            <Button
                                                type="button"
                                                onClick={handleAddPricingTier}
                                                className="bg-[#8CE232] text-black px-6 py-2 rounded-lg hover:bg-[#8CE232]/90 transition-colors"
                                            >
                                                Add Pricing Tier
                                            </Button>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Pricing Tiers Table */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 text-[#8CE232]">Pricing Tiers Added</h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12 text-center">No.</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Price</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Features</TableHead>
                                                        <TableHead>Highlighted</TableHead>
                                                        <TableHead className="text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {pricingTiers.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                                                                No pricing tiers added.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        pricingTiers.map((tier, idx) => (
                                                            <TableRow key={idx}>
                                                                <TableCell className="text-center font-semibold">{idx + 1}</TableCell>
                                                                <TableCell className="font-semibold">{tier.name}</TableCell>
                                                                <TableCell className="font-bold text-[#8CE232]">{tier.price}</TableCell>
                                                                <TableCell>{tier.description}</TableCell>
                                                                <TableCell>
                                                                    <ul className="list-disc pl-4">
                                                                        {tier.features.map((feature, fIdx) => (
                                                                            <li key={fIdx} className="text-sm">{feature}</li>
                                                                        ))}
                                                                    </ul>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {tier.highlighted ? (
                                                                        <span className="bg-[#8CE232] text-black px-2 py-1 rounded text-xs font-semibold">
                                                                            ⭐ Highlighted
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-400 text-xs">No</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => removePricingTier(idx)}
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-red-500 hover:bg-red-100"
                                                                        aria-label="Delete Pricing Tier"
                                                                    >
                                                                        <Trash2 size={20} />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-[#8CE232] text-black font-bold py-6 rounded-lg hover:bg-[#8CE232]/90 transition-colors"
                            >
                                Update Proposal
                            </Button>
                        </form>
                    </FormProvider>
                </Card>

                {/* Right: Live Preview */}
                <div className="bg-slate-50 text-slate-800 font-sans rounded-2xl border border-slate-200 shadow-xl p-0 overflow-y-auto">
                    {/* Banner */}
                    <div className="bg-black px-8 py-3 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <img
                                src="/resources/images/reaiv-logo.png"
                                alt="Reaiv logo"
                                width={192}
                                height={48}
                                className="h-12 w-auto"
                            />
                            <span className="text-md md:text-xl font-bold ml-[-10px] text-white">x</span>
                            {form.watch("logo_base64") ? (
                                <img src={form.watch("logo_base64")} alt="Proposal Logo" className="h-9 w-auto" />
                            ) : (
                                <span className="text-slate-400">No logo</span>
                            )}
                        </div>
                    </div>

                    {/* Hero Section */}
                    <section id="top" className="relative overflow-hidden py-[70px]">
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8CE232]/20 via-white to-emerald-50"></div>
                        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
                            <div className="flex flex-col items-center justify-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    <span className="text-[#8CE232]">Reaiv</span> x {form.watch("client_name")}
                                </h2>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                                {form.watch("hero.headline")}
                            </h1>
                            <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-3xl mx-auto">
                                {form.watch("hero.subtitle")}
                            </p>
                            <ul className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16 text-sm">
                                {(form.watch("hero.highlights") || []).map((h: any, idx: number) => {
                                    if (typeof h === "string") {
                                        return (
                                            <li key={h + idx} className="bg-white rounded-xl p-4 border border-slate-200 w-[15rem] h-auto">
                                                <span className="block text-2xl font-bold">{h}</span>
                                            </li>
                                        );
                                    } else {
                                        return (
                                            <li key={h.title + idx} className="bg-white rounded-xl p-4 border border-slate-200 w-[15rem] h-auto">
                                                <span className="block text-2xl font-bold">{h.title}</span>
                                                <span className="block mt-2 text-slate-600">{h.desc}</span>
                                            </li>
                                        );
                                    }
                                })}
                            </ul>
                        </div>
                    </section>

                    {/* Overview Section */}
                    <section id="overview" className="py-12 md:py-16 bg-white border-t border-b border-slate-200">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Overview</h2>
                            <p className="mt-3 md:mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto px-2">
                                {form.watch("overview")}
                            </p>
                            {form.watch("overview_details.title")?.trim() && form.watch("overview_details.description")?.trim() && (
                                <div className="mt-6 md:mt-8 text-left bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl p-4 md:p-5 mx-2 sm:mx-0">
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                                        {form.watch("overview_details.title")}
                                    </h3>
                                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        {form.watch("overview_details.description")}
                                    </p>
                                    {form.watch("overview_details.items")?.length > 0 && (
                                        <ul className="mt-3 text-xs sm:text-sm text-slate-700 space-y-1.5 list-disc pl-4 sm:pl-5">
                                            {form.watch("overview_details.items").map((item: any, idx: number) => (
                                                <li key={idx} className="leading-relaxed">
                                                    <strong className="text-slate-900">{item.label}:</strong>{" "}
                                                    <span className="text-slate-700">{item.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Proposed Solutions Section */}
                    <section id="services" className="py-12 sm:py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                                Proposed Solutions
                            </h2>
                            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {(form.watch("solutions") || []).map((card: any, idx: number) => (
                                    <div key={idx} className="card rounded-2xl border border-[#8CE232] bg-white p-4 sm:p-6 hover:scale-[1.01] transition-transform">
                                        <h3 className="text-base sm:text-lg font-semibold">{card.title}</h3>
                                        <p className="mt-2 text-xs sm:text-sm text-slate-600">{card.description}</p>
                                        <ul className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-700 space-y-1 list-disc pl-4">
                                            {card.bullets.map((b: string, i: number) => (
                                                <li key={i}>{b}</li>
                                            ))}
                                        </ul>
                                        {card.benefit && (
                                            <p className="mt-3 sm:mt-4 text-xs text-slate-500"><strong>Benefit:</strong> {card.benefit}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    {pricingTiers.length > 0 && (
                        <section id="pricing" className="py-16 sm:py-20 bg-white border-t border-b border-slate-200">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                                <div className="flex items-end justify-between flex-wrap gap-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Pricing</h2>
                                        <p className="mt-2 text-sm sm:text-base text-slate-600">
                                            Simple, transparent tiers. Pick what fits today—scale when you need more.
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        PHP pricing • Taxes, 3rd-party fees not included
                                    </span>
                                </div>

                                {/* Dynamic Grid Layout based on number of tiers */}
                                <div className={`mt-8 grid gap-4 sm:gap-6 ${pricingTiers.length === 1
                                    ? 'grid-cols-1 max-w-sm mx-auto' // Single card - centered and narrow
                                    : pricingTiers.length === 2
                                        ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' // Two cards - responsive
                                        : pricingTiers.length === 3
                                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' // Three cards - responsive breakpoints
                                            : pricingTiers.length === 4
                                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' // Four cards - 2x2 on tablet, 1x4 on desktop
                                                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' // 5+ cards - multiple rows
                                    }`}>
                                    {pricingTiers.map((tier, idx) => (
                                        <div
                                            key={idx}
                                            className={`relative block rounded-2xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${tier.highlighted
                                                ? 'border-[#8CE232] bg-gradient-to-br from-white to-[#8CE232]/10 shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                } ${pricingTiers.length === 1 ? 'min-h-[400px]' : 'min-h-[350px]'
                                                }`}
                                            aria-label={`${tier.name} Pricing`}
                                        >
                                            {tier.highlighted && (
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                    <span className="bg-[#8CE232] text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                        ⭐ POPULAR
                                                    </span>
                                                </div>
                                            )}

                                            <div className="text-center">
                                                <h3 className={`font-semibold text-slate-900 ${pricingTiers.length === 1 ? 'text-xl' : 'text-lg'
                                                    }`}>
                                                    {tier.name}
                                                </h3>

                                                <div className="mt-4 flex items-baseline justify-center gap-1">
                                                    <span className={`font-extrabold tracking-tight text-slate-900 ${pricingTiers.length === 1 ? 'text-5xl' : 'text-4xl'
                                                        }`}>
                                                        {tier.price}
                                                    </span>
                                                </div>

                                                <p className={`text-slate-500 mt-2 ${pricingTiers.length === 1 ? 'text-base' : 'text-sm'
                                                    }`}>
                                                    {tier.description}
                                                </p>
                                            </div>

                                            <div className="mt-6">
                                                <ul className={`space-y-2 text-slate-700 ${pricingTiers.length === 1 ? 'text-base' : 'text-sm'
                                                    }`}>
                                                    {tier.features.map((feature, fIdx) => (
                                                        <li key={fIdx} className="flex items-start gap-2">
                                                            <span className="text-[#8CE232] mt-1 flex-shrink-0">✓</span>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {pricingTiers.length === 1 && (
                                                <div className="mt-8 text-center">
                                                    <button className="w-full bg-[#8CE232] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#7ab33a] transition-colors">
                                                        Get Started
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 space-y-4">
                                    <p className="text-xs text-slate-500 text-center">
                                        Note: Complex software features, additional integrations, and compliance requirements may adjust the final
                                        estimate after discovery. Maintenance fees are not included.
                                    </p>

                                    <div className="bg-[#8CE232] rounded-lg p-6">
                                        <p className="text-base text-center text-black font-medium">
                                            You can explore our portfolio on our website{" "}
                                            <span className="text-white font-semibold">
                                                <a
                                                    href="https://www.reaiv.com/portfolio"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:no-underline transition-all"
                                                >
                                                    Click Here!
                                                </a>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Migration Process Section */}
                    <section id="process" className="py-12 sm:py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Migration & Delivery Process</h2>
                            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                                {(form.watch("migration_process") || []).map((process: any, idx: number) => {
                                    if (!process.step || !process.description) return null;
                                    return (
                                        <div key={idx} className="rounded-2xl border border-slate-200 p-4 sm:p-6 bg-white">
                                            <span className="text-xs font-medium text-[#8CE232]">Step {idx + 1}</span>
                                            <h3 className="mt-1 text-sm sm:text-base font-semibold">{process.step}</h3>
                                            <p className="mt-1 text-xs sm:text-sm text-slate-600">{process.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Timeline Section */}
                    {timelines.length > 0 && (
                        <section id="timeline" className="py-12 sm:py-16 bg-white border-t border-b border-slate-200">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Project Timeline</h2>
                                <div className="mt-6 sm:mt-8 space-y-8 sm:space-y-12">
                                    {timelines.map((timeline: any, timelineIdx: number) => (
                                        <div key={timelineIdx}>
                                            <h3 className="text-lg sm:text-xl font-semibold text-[#8CE232] mb-4 sm:mb-6">
                                                {timeline.title}
                                            </h3>
                                            <div className="space-y-4 sm:space-y-6">
                                                {timeline.steps.map((step: any, stepIdx: number) => {
                                                    if (!step.label || !step.desc) return null;
                                                    return (
                                                        <div key={stepIdx} className="flex gap-3 sm:gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                                {stepIdx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base sm:text-lg font-semibold text-slate-900">{step.label}</h4>
                                                                <p className="mt-1 text-xs sm:text-sm text-slate-600">{step.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                    {/* Footer */}
                    <footer className="py-6 sm:py-8 border-t border-slate-200 text-center text-xs text-slate-500">
                        © {new Date().getFullYear()} Reaiv — Automation & Software Development
                    </footer>
                </div>
            </div>
        </div>
    );
}