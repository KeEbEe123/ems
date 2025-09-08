"use client";

import { useState } from "react";
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

export function EventInfoPage() {
  const [activeTab, setActiveTab] = useState<TabType>("details");

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

  const tabs = [
    { id: "details", label: "Event Details" },
    { id: "forms", label: "Forms" },
    { id: "coupons", label: "Coupons" },
    { id: "tickets", label: "Tickets" },
  ];

  // Form Functions
  const addFormField = () => {
    if (newField.label) {
      const field: FormField = {
        id: Date.now().toString(),
        type: newField.type || "text",
        label: newField.label,
        required: newField.required || false,
        options: newField.options,
      };
      setFormFields([...formFields, field]);
      setNewField({ type: "text", label: "", required: false });
    }
  };

  const removeFormField = (id: string) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  // Coupon Functions
  const addCoupon = () => {
    if (newCoupon.code) {
      const coupon: Coupon = {
        id: Date.now().toString(),
        code: newCoupon.code.toUpperCase(),
        discount: newCoupon.discount,
        type: newCoupon.type,
        maxUses: newCoupon.maxUses,
        currentUses: 0,
        active: true,
      };
      setCoupons([...coupons, coupon]);
      setNewCoupon({ code: "", discount: 0, type: "percentage", maxUses: 100 });
    }
  };

  const toggleCoupon = (id: string) => {
    setCoupons(
      coupons.map((coupon) =>
        coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
      )
    );
  };

  const removeCoupon = (id: string) => {
    setCoupons(coupons.filter((coupon) => coupon.id !== id));
  };

  // Ticket Functions
  const addTicket = () => {
    if (newTicket.name) {
      const ticket: Ticket = {
        id: Date.now().toString(),
        name: newTicket.name,
        class: newTicket.class,
        price: newTicket.price,
        inclusions: newTicket.inclusions.filter((inc) => inc.trim() !== ""),
        available: newTicket.available,
      };
      setTickets([...tickets, ticket]);
      setNewTicket({
        name: "",
        class: "general",
        price: 0,
        inclusions: [""],
        available: 100,
      });
    }
  };

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
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
          Club - Event Dashboard - Event Info Page
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

            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Event Details
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
