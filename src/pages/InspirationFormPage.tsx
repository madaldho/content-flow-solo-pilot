
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { InspirationForm } from "@/components/InspirationForm";
import { useParams, useNavigate } from "react-router-dom";
import { useInspiration } from "@/context/InspirationContext";
import { ContentInspiration } from "@/types/inspiration";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function InspirationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspirationById, isLoading } = useInspiration();
  const [inspiration, setInspiration] = useState<ContentInspiration | undefined>(undefined);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      const foundInspiration = getInspirationById(id);
      if (foundInspiration) {
        setInspiration(foundInspiration);
      } else {
        navigate("/inspiration", { replace: true });
      }
    }
  }, [id, isEditing, getInspirationById, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-lg">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/inspiration")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Inspiration" : "Add New Inspiration"}
          </h1>
        </div>
        
        <InspirationForm 
          initialData={inspiration} 
          isEditing={isEditing} 
        />
      </div>
    </Layout>
  );
}
