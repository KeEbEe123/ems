"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/browserClient";
import DetailsTab from "@/components/event-info/DetailsTab";
import FormsTab from "@/components/event-info/FormsTab";
import CouponsTab from "@/components/event-info/CouponsTab";
import TicketsTab from "@/components/event-info/TicketsTab";
import type {
  TabType,
  FormField,
  Coupon,
  Ticket,
  Event,
  BannerState,
} from "@/components/event-info/types";

interface EventInfoPageProps {
  event: Event;
  onEventUpdate: () => void;
}

export function EventInfoPage({ event, onEventUpdate }: EventInfoPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isSaving, setIsSaving] = useState(false);
  // Banners
  const [banners, setBanners] = useState<BannerState>({
    banner_1x1: null,
    banner_16x9: null,
    banner_21x9: null,
    logo_png: null,
  });

  // JSON key mapping for events.banners
  const bannerKeyMap: Record<keyof typeof banners, string> = {
    banner_1x1: "1x1",
    banner_16x9: "16:9",
    banner_21x9: "21:9",
    logo_png: "logo",
  };

  const setBannersFromJson = (
    json: Record<string, string> | null | undefined
  ) => {
    if (!json) return;
    setBanners((prev) => ({
      banner_1x1: json["1x1"] ? { path: "", url: json["1x1"] } : null,
      banner_16x9: json["16:9"] ? { path: "", url: json["16:9"] } : null,
      banner_21x9: json["21:9"] ? { path: "", url: json["21:9"] } : null,
      logo_png: json["logo"] ? { path: "", url: json["logo"] } : null,
    }));
  };

  const buildBannersJson = (state: typeof banners) => {
    const out: Record<string, string> = {};
    if (state.banner_1x1?.url) out["1x1"] = state.banner_1x1.url;
    if (state.banner_16x9?.url) out["16:9"] = state.banner_16x9.url;
    if (state.banner_21x9?.url) out["21:9"] = state.banner_21x9.url;
    if (state.logo_png?.url) out["logo"] = state.logo_png.url;
    return out;
  };

  // Event Details State
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    category: "",
    status: "draft",
  });

  // Initialize event details with event data
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.start_datetime);
      const endDate = new Date(event.end_datetime);

      setEventDetails({
        name: event.name || "",
        description: event.additional_details || "",
        date: startDate.toISOString().split("T")[0],
        time: startDate.toTimeString().slice(0, 5),
        location: event.venue || "",
        capacity: "100", // Default value since not in event schema
        category: event.event_type || "",
        status: event.status || "draft",
      });

      // Initialize banners from events.banners JSON if present
      setBannersFromJson((event as any).banners);
    }
  }, [event]);

  // Load existing banners from storage (public bucket assumed) if DB banners missing
  useEffect(() => {
    const loadBanners = async () => {
      if (!event?.id) return;
      // If we already have banners from DB, skip listing
      const hasAny = Object.values(banners).some(Boolean);
      if (hasAny) return;
      const bucket = "event-assets"; // recommended bucket
      const basePath = `${event.id}/banners`;
      try {
        // Attempt to fetch known keys; public URLs are deterministic if present
        const keys = [
          { k: "banner_1x1", file: "banner_1x1" },
          { k: "banner_16x9", file: "banner_16x9" },
          { k: "banner_21x9", file: "banner_21x9" },
          { k: "logo_png", file: "logo_png" },
        ] as const;

        const found: Partial<typeof banners> = {};
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(basePath);
        if (!error && data && data.length > 0) {
          for (const { k, file } of keys) {
            const match = data.find((d) => d.name.startsWith(file));
            if (match) {
              const path = `${basePath}/${match.name}`;
              const { data: pub } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);
              (found as any)[k] = { path, url: pub.publicUrl };
            }
          }
        }
        // Merge only found entries to avoid wiping out newly set values
        setBanners((prev) => ({ ...prev, ...(found as any) }));
      } catch (e) {
        console.error("Error loading banners:", e);
      }
    };
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  // Save event function
  const saveEventDetails = async () => {
    if (!event) return;

    setIsSaving(true);
    try {
      // Combine date and time for start_datetime
      const startDateTime = new Date(
        `${eventDetails.date}T${eventDetails.time}:00Z`
      );
      const endDateTime = new Date(
        startDateTime.getTime() + 2 * 60 * 60 * 1000
      ); // Add 2 hours as default

      const { error } = await supabase
        .from("events")
        .update({
          name: eventDetails.name,
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          event_type: eventDetails.category,
          venue: eventDetails.location,
          city: eventDetails.location,
          country: "Online", // Default value
          additional_details: eventDetails.description,
        })
        .eq("id", event.id);

      if (error) {
        console.error("Error updating event:", error);
        alert("Error updating event. Please try again.");
        return;
      }

      alert("Event updated successfully!");
      onEventUpdate(); // Refresh the event data
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Forms State
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: "text",
    label: "",
    required: false,
  });

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<{ code: string; discount: number; type: "percentage" | "fixed"; maxUses: number }>({
    code: "",
    discount: 0,
    type: "percentage",
    maxUses: 100,
  });

  // Tickets State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({
    name: "",
    class: "general" as const,
    price: 0,
    inclusions: [""],
    available: 100,
  });

  // Load data from Supabase
  useEffect(() => {
    if (event) {
      loadFormFields();
      loadCoupons();
      loadTickets();
    }
  }, [event]);

  const loadFormFields = async () => {
    try {
      const { data, error } = await supabase
        .from("event_forms")
        .select("*")
        .eq("event_id", event.id)
        .order("field_order");

      if (error) {
        console.error("Error loading form fields:", error);
        return;
      }

      setFormFields(
        data?.map((field) => ({
          id: field.id,
          type: field.field_type,
          label: field.field_label,
          required: field.field_required,
          options: field.field_options,
        })) || []
      );
    } catch (error) {
      console.error("Error loading form fields:", error);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("event_coupons")
        .select("*")
        .eq("event_id", event.id);

      if (error) {
        console.error("Error loading coupons:", error);
        return;
      }

      setCoupons(
        data?.map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          discount: coupon.discount_amount,
          type: coupon.discount_type,
          maxUses: coupon.max_uses,
          currentUses: coupon.current_uses,
          active: coupon.is_active,
        })) || []
      );
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  };

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("event_tickets")
        .select("*")
        .eq("event_id", event.id);

      if (error) {
        console.error("Error loading tickets:", error);
        return;
      }

      setTickets(
        data?.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          class: ticket.ticket_class,
          price: ticket.price,
          inclusions: ticket.inclusions || [],
          available: ticket.available_quantity,
        })) || []
      );
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };

  const tabs = [
    { id: "details", label: "Event Details" },
    { id: "forms", label: "Forms" },
    { id: "coupons", label: "Coupons" },
    { id: "tickets", label: "Tickets" },
  ];

  // Form Functions
  const addFormField = async () => {
    if (!newField.label || !event) return;

    try {
      const { data, error } = await supabase
        .from("event_forms")
        .insert([
          {
            event_id: event.id,
            field_type: newField.type || "text",
            field_label: newField.label,
            field_required: newField.required || false,
            field_options: newField.options || [],
            field_order: formFields.length,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding form field:", error);
        alert("Error adding form field. Please try again.");
        return;
      }

      const newFormField: FormField = {
        id: data.id,
        type: data.field_type,
        label: data.field_label,
        required: data.field_required,
        options: data.field_options,
      };

      setFormFields([...formFields, newFormField]);
      setNewField({ type: "text", label: "", required: false });
    } catch (error) {
      console.error("Error adding form field:", error);
      alert("Error adding form field. Please try again.");
    }
  };

  const removeFormField = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_forms")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error removing form field:", error);
        alert("Error removing form field. Please try again.");
        return;
      }

      setFormFields(formFields.filter((field) => field.id !== id));
    } catch (error) {
      console.error("Error removing form field:", error);
      alert("Error removing form field. Please try again.");
    }
  };

  // Coupon Functions
  const addCoupon = async () => {
    if (!newCoupon.code || !event) return;

    try {
      const { data, error } = await supabase
        .from("event_coupons")
        .insert([
          {
            event_id: event.id,
            code: newCoupon.code.toUpperCase(),
            discount_amount: newCoupon.discount,
            discount_type: newCoupon.type,
            max_uses: newCoupon.maxUses,
            current_uses: 0,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding coupon:", error);
        alert("Error adding coupon. Please try again.");
        return;
      }

      const newCouponData: Coupon = {
        id: data.id,
        code: data.code,
        discount: data.discount_amount,
        type: data.discount_type,
        maxUses: data.max_uses,
        currentUses: data.current_uses,
        active: data.is_active,
      };

      setCoupons([...coupons, newCouponData]);
      setNewCoupon({ code: "", discount: 0, type: "percentage", maxUses: 100 });
    } catch (error) {
      console.error("Error adding coupon:", error);
      alert("Error adding coupon. Please try again.");
    }
  };

  const toggleCoupon = async (id: string) => {
    try {
      const coupon = coupons.find((c) => c.id === id);
      if (!coupon) return;

      const { error } = await supabase
        .from("event_coupons")
        .update({ is_active: !coupon.active })
        .eq("id", id);

      if (error) {
        console.error("Error toggling coupon:", error);
        alert("Error updating coupon. Please try again.");
        return;
      }

      setCoupons(
        coupons.map((coupon) =>
          coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
        )
      );
    } catch (error) {
      console.error("Error toggling coupon:", error);
      alert("Error updating coupon. Please try again.");
    }
  };

  const removeCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_coupons")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error removing coupon:", error);
        alert("Error removing coupon. Please try again.");
        return;
      }

      setCoupons(coupons.filter((coupon) => coupon.id !== id));
    } catch (error) {
      console.error("Error removing coupon:", error);
      alert("Error removing coupon. Please try again.");
    }
  };

  // Ticket Functions
  const addTicket = async () => {
    if (!newTicket.name || !event) return;

    try {
      const { data, error } = await supabase
        .from("event_tickets")
        .insert([
          {
            event_id: event.id,
            name: newTicket.name,
            ticket_class: newTicket.class,
            price: newTicket.price,
            inclusions: newTicket.inclusions.filter((inc) => inc.trim() !== ""),
            available_quantity: newTicket.available,
            sold_quantity: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding ticket:", error);
        alert("Error adding ticket. Please try again.");
        return;
      }

      const newTicketData: Ticket = {
        id: data.id,
        name: data.name,
        class: data.ticket_class,
        price: data.price,
        inclusions: data.inclusions || [],
        available: data.available_quantity,
      };

      setTickets([...tickets, newTicketData]);
      setNewTicket({
        name: "",
        class: "general",
        price: 0,
        inclusions: [""],
        available: 100,
      });
    } catch (error) {
      console.error("Error adding ticket:", error);
      alert("Error adding ticket. Please try again.");
    }
  };

  const removeTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_tickets")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error removing ticket:", error);
        alert("Error removing ticket. Please try again.");
        return;
      }

      setTickets(tickets.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error("Error removing ticket:", error);
      alert("Error removing ticket. Please try again.");
    }
  };

  const addInclusion = () => {
    setNewTicket({ ...newTicket, inclusions: [...newTicket.inclusions, ""] });
  };

  const updateInclusion = (index: number, value: string) => {
    const updated = [...newTicket.inclusions];
    updated[index] = value;
    setNewTicket({ ...newTicket, inclusions: updated });
  };

  const removeInclusion = (index: number) => {
    setNewTicket({
      ...newTicket,
      inclusions: newTicket.inclusions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - {event?.name || "Event Info Page"}
        </h1>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={
                activeTab === tab.id
                  ? "bg-white text-black hover:bg-gray-100 rounded-sm px-4 py-1 text-sm"
                  : "text-white hover:bg-neutral-800 rounded-sm px-4 py-1 text-sm"
              }
              onClick={() => setActiveTab(tab.id as TabType)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      {activeTab === "details" && (
        <DetailsTab
          event={event}
          eventDetails={eventDetails}
          setEventDetails={setEventDetails}
          isSaving={isSaving}
          saveEventDetails={saveEventDetails}
          banners={banners}
          setBanners={setBanners}
          buildBannersJson={buildBannersJson}
        />
      )}
      {activeTab === "forms" && (
        <FormsTab
          formFields={formFields}
          newField={newField}
          setNewField={setNewField}
          addFormField={addFormField}
          removeFormField={removeFormField}
        />
      )}
      {activeTab === "coupons" && (
        <CouponsTab
          coupons={coupons}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
          addCoupon={addCoupon}
          toggleCoupon={toggleCoupon}
          removeCoupon={removeCoupon}
        />
      )}
      {activeTab === "tickets" && (
        <TicketsTab
          tickets={tickets}
          newTicket={newTicket}
          setNewTicket={setNewTicket}
          addTicket={addTicket}
          removeTicket={removeTicket}
          addInclusion={addInclusion}
          updateInclusion={updateInclusion}
          removeInclusion={removeInclusion}
        />
      )}
    </div>
  );
}
