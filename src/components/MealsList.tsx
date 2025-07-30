import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Trash2, Coffee, Sun, Moon } from "lucide-react";

interface Meal {
  id: string;
  food_name: string;
  quantity: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_date: string;
}

interface MealsListProps {
  meals: Meal[];
  onMealDeleted: () => void;
}

const getMealIcon = (mealType: string) => {
  switch (mealType) {
    case "breakfast":
      return <Coffee className="h-4 w-4" />;
    case "lunch":
      return <Sun className="h-4 w-4" />;
    case "dinner":
      return <Moon className="h-4 w-4" />;
    default:
      return null;
  }
};

const getMealColor = (mealType: string) => {
  switch (mealType) {
    case "breakfast":
      return "bg-orange-100 text-orange-800";
    case "lunch":
      return "bg-yellow-100 text-yellow-800";
    case "dinner":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const MealsList = ({ meals, onMealDeleted }: MealsListProps) => {
  const { user } = useAuth();

  const deleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from("meals")
        .delete()
        .eq("id", mealId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Meal deleted",
        description: "The meal has been removed from your log.",
      });

      onMealDeleted();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting meal",
        description: error.message,
      });
    }
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    if (!acc[meal.meal_type]) {
      acc[meal.meal_type] = [];
    }
    acc[meal.meal_type].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <div className="space-y-6">
      {["breakfast", "lunch", "dinner"].map((mealType) => (
        <Card key={mealType}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getMealIcon(mealType)}
              {mealType}
              {groupedMeals[mealType] && (
                <Badge variant="secondary">
                  {groupedMeals[mealType].length} items
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedMeals[mealType] && groupedMeals[mealType].length > 0 ? (
              <div className="space-y-3">
                {groupedMeals[mealType].map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">{meal.food_name}</h4>
                        <Badge className={getMealColor(meal.meal_type)}>
                          {meal.quantity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMeal(meal.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No {mealType} meals added yet
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MealsList;