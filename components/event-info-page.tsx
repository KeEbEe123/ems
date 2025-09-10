"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TabType = "details" | "forms" | "coupons" | "tickets";

interface FormField {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  maxUses: number;
  currentUses: number;
  active: boolean;
}

interface Ticket {
  id: string;
  name: string;
  class: "general" | "vip" | "premium";
  price: number;
  inclusions: string[];
  available: number;
}

interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  venue: string;
  city: string;
  country: string;
  additional_details: string;
  created_at: string;
  updated_at: string;
}

interface EventInfoPageProps {
  event: Event;
  onEventUpdate: () => void;
}

export function EventInfoPage({ event, onEventUpdate }: EventInfoPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isSaving, setIsSaving] = useState(false);

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
    }
  }, [event]);

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
          status: eventDetails.status,
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
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: 0,
    type: "percentage" as const,
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

      {/* Event Details Tab */}
      {activeTab === "details" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventName" className="text-white">
                  Event Name
                </Label>
                <Input
                  id="eventName"
                  value={eventDetails.name}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, name: e.target.value })
                  }
                  className="bg-neutral-800 border-neutral-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>
                <Select
                  value={eventDetails.category}
                  onValueChange={(value) =>
                    setEventDetails({ ...eventDetails, category: value })
                  }
                >
                  <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={eventDetails.description}
                onChange={(e) =>
                  setEventDetails({
                    ...eventDetails,
                    description: e.target.value,
                  })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="text-white">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, date: e.target.value })
                  }
                  className="bg-neutral-800 border-neutral-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-white">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={eventDetails.time}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, time: e.target.value })
                  }
                  className="bg-neutral-800 border-neutral-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="capacity" className="text-white">
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={eventDetails.capacity}
                  onChange={(e) =>
                    setEventDetails({
                      ...eventDetails,
                      capacity: e.target.value,
                    })
                  }
                  className="bg-neutral-800 border-neutral-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-white">
                Location
              </Label>
              <Input
                id="location"
                value={eventDetails.location}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, location: e.target.value })
                }
                className="bg-neutral-800 border-neutral-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-white">
                Status
              </Label>
              <Select
                value={eventDetails.status}
                onValueChange={(value) =>
                  setEventDetails({ ...eventDetails, status: value })
                }
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveEventDetails}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Event Details"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Forms Tab */}
      {activeTab === "forms" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Form Creator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-neutral-600 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">Add New Field</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-white">Field Type</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(value) =>
                      setNewField({ ...newField, type: value as any })
                    }
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Label</Label>
                  <Input
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={newField.required}
                    onCheckedChange={(checked) =>
                      setNewField({ ...newField, required: checked })
                    }
                  />
                  <Label className="text-white">Required</Label>
                </div>
                <div className="pt-6">
                  <Button
                    onClick={addFormField}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-medium">Form Fields</h3>
              {formFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant="outline"
                      className="text-white border-neutral-600"
                    >
                      {field.type}
                    </Badge>
                    <span className="text-white">{field.label}</span>
                    {field.required && (
                      <Badge className="bg-red-600">Required</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFormField(field.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formFields.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No form fields created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupons Tab */}
      {activeTab === "coupons" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Coupon Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-neutral-600 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">Create New Coupon</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-white">Coupon Code</Label>
                  <Input
                    value={newCoupon.code}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, code: e.target.value })
                    }
                    placeholder="SAVE20"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Discount</Label>
                  <Input
                    type="number"
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discount: Number(e.target.value),
                      })
                    }
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Type</Label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value) =>
                      setNewCoupon({ ...newCoupon, type: value as any })
                    }
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Max Uses</Label>
                  <Input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        maxUses: Number(e.target.value),
                      })
                    }
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={addCoupon}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-medium">Active Coupons</h3>
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between bg-neutral-800 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <code className="bg-neutral-700 px-2 py-1 rounded text-white font-mono">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-white">
                      {coupon.discount}
                      {coupon.type === "percentage" ? "%" : "$"} off
                    </span>
                    <span className="text-neutral-400">
                      {coupon.currentUses}/{coupon.maxUses} uses
                    </span>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={() => toggleCoupon(coupon.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoupon(coupon.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No coupons created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Ticket Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-neutral-600 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">Create New Ticket</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-white">Ticket Name</Label>
                  <Input
                    value={newTicket.name}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, name: e.target.value })
                    }
                    placeholder="General Admission"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Ticket Class</Label>
                  <Select
                    value={newTicket.class}
                    onValueChange={(value) =>
                      setNewTicket({ ...newTicket, class: value as any })
                    }
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Price ($)</Label>
                  <Input
                    type="number"
                    value={newTicket.price}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        price: Number(e.target.value),
                      })
                    }
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Available Quantity</Label>
                  <Input
                    type="number"
                    value={newTicket.available}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        available: Number(e.target.value),
                      })
                    }
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-white">What's Included</Label>
                <div className="space-y-2 mt-2">
                  {newTicket.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={inclusion}
                        onChange={(e) => updateInclusion(index, e.target.value)}
                        placeholder="e.g., Event access, Welcome drink"
                        className="bg-neutral-800 border-neutral-600 text-white"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInclusion(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    onClick={addInclusion}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Inclusion
                  </Button>
                </div>
              </div>

              <Button
                onClick={addTicket}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-medium">Created Tickets</h3>
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-medium">{ticket.name}</h4>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            ticket.class === "general"
                              ? "border-blue-500 text-blue-400"
                              : ""
                          }
                          ${
                            ticket.class === "vip"
                              ? "border-yellow-500 text-yellow-400"
                              : ""
                          }
                          ${
                            ticket.class === "premium"
                              ? "border-purple-500 text-purple-400"
                              : ""
                          }
                        `}
                      >
                        {ticket.class.toUpperCase()}
                      </Badge>
                      <span className="text-green-400 font-semibold">
                        ${ticket.price}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-neutral-400">
                        {ticket.available} available
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicket(ticket.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-400 text-sm mb-2">Includes:</p>
                    <ul className="text-white text-sm space-y-1">
                      {ticket.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {inclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-neutral-400 text-center py-8">
                  No tickets created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
