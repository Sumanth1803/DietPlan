import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus } from "lucide-react";

interface MealFormProps {
  onMealAdded: () => void;
}

const MealForm = ({ onMealAdded }: MealFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">("breakfast");

  // Common foods with their nutritional values (per 100g)
  const commonFoods = {
    "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
    "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
    "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
    "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 },
    "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
    "milk": { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
    "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
    "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
    "pasta": { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
  };

  const getNutritionalData = (food: string, qty: string) => {
    const lowerFood = food.toLowerCase();
    const foundFood = Object.keys(commonFoods).find(key => 
      lowerFood.includes(key) || key.includes(lowerFood)
    );

    if (foundFood) {
      const baseNutrition = commonFoods[foundFood as keyof typeof commonFoods];
      // Simple quantity multiplier (assumes 100g as base)
      const multiplier = qty.includes("cup") ? 1.5 : 
                        qty.includes("slice") ? 0.3 :
                        qty.includes("piece") ? 1 : 1;
      
      return {
        calories: Math.round(baseNutrition.calories * multiplier),
        protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
        carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
        fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
        fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
        sugar: Math.round(baseNutrition.sugar * multiplier * 10) / 10,
        sodium: Math.round(baseNutrition.sodium * multiplier),
      };
    }

    // Default values for unknown foods
    return {
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 2,
      sugar: 5,
      sodium: 50,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !user) return;

    setIsLoading(true);

    try {
      const nutritionData = getNutritionalData(foodName, quantity || "1 serving");
      
      const { error } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          food_name: foodName,
          quantity: quantity || "1 serving",
          meal_type: mealType,
          ...nutritionData,
        });

      if (error) throw error;

      toast({
        title: "Meal added!",
        description: `${foodName} has been added to your ${mealType}.`,
      });

      setFoodName("");
      setQuantity("");
      onMealAdded();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding meal",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Meal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="food-name">Food Name</Label>
              <Input
                id="food-name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., chicken breast"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 1 cup, 100g"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Meal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealForm;