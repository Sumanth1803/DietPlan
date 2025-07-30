import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface NutritionRecommendationsProps {
  data: NutritionData;
}

// Recommended daily values (average adult)
const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
};

const FOOD_RECOMMENDATIONS = {
  protein: ["chicken breast", "eggs", "greek yogurt", "lentils", "salmon"],
  fiber: ["broccoli", "apples", "oats", "beans", "quinoa"],
  "healthy fats": ["avocado", "nuts", "olive oil", "salmon", "seeds"],
  "complex carbs": ["brown rice", "sweet potato", "quinoa", "oats", "whole grain bread"],
};

const NutritionRecommendations = ({ data }: NutritionRecommendationsProps) => {
  const getPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDeficiencies = () => {
    const deficiencies = [];
    
    if (data.protein < DAILY_TARGETS.protein * 0.7) {
      deficiencies.push({
        nutrient: "protein",
        current: data.protein,
        target: DAILY_TARGETS.protein,
        foods: FOOD_RECOMMENDATIONS.protein,
      });
    }
    
    if (data.fiber < DAILY_TARGETS.fiber * 0.5) {
      deficiencies.push({
        nutrient: "fiber",
        current: data.fiber,
        target: DAILY_TARGETS.fiber,
        foods: FOOD_RECOMMENDATIONS.fiber,
      });
    }

    return deficiencies;
  };

  const getExcesses = () => {
    const excesses = [];
    
    if (data.sugar > DAILY_TARGETS.sugar) {
      excesses.push({
        nutrient: "sugar",
        current: data.sugar,
        target: DAILY_TARGETS.sugar,
      });
    }
    
    if (data.sodium > DAILY_TARGETS.sodium) {
      excesses.push({
        nutrient: "sodium",
        current: data.sodium,
        target: DAILY_TARGETS.sodium,
      });
    }

    return excesses;
  };

  const deficiencies = getDeficiencies();
  const excesses = getExcesses();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(DAILY_TARGETS).map(([nutrient, target]) => {
            const current = data[nutrient as keyof NutritionData];
            const percentage = getPercentage(current, target);
            const isOver = current > target;
            
            return (
              <div key={nutrient} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{nutrient}</span>
                  <span className="text-sm text-muted-foreground">
                    {current} / {target} {nutrient === 'calories' ? 'cal' : 
                      nutrient === 'sodium' ? 'mg' : 'g'}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-2 ${isOver ? 'bg-red-100' : ''}`}
                />
                {isOver && (
                  <p className="text-xs text-orange-600">
                    Over recommended daily intake
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {deficiencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Nutrition Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deficiencies.map((deficiency) => (
              <div key={deficiency.nutrient} className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium capitalize">
                    Low {deficiency.nutrient}
                  </span>
                  <Badge variant="outline">
                    {Math.round(deficiency.current)}g / {deficiency.target}g
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Try adding these foods: {deficiency.foods.join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {excesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Watch Your Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {excesses.map((excess) => (
              <div key={excess.nutrient} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">
                    High {excess.nutrient}
                  </span>
                  <Badge variant="destructive">
                    {Math.round(excess.current)} / {excess.target}
                    {excess.nutrient === 'sodium' ? 'mg' : 'g'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Consider reducing {excess.nutrient} intake for better health.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {deficiencies.length === 0 && excesses.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Great Job!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your nutrition intake looks balanced for today. Keep up the great work!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionRecommendations;