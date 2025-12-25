import { API_URLS } from '../constants/api';

export interface MealTemplateType {
    id: string;
    name: string;
    description: string;
    goal: string[];
}

class MealTemplateService {
    async getTypes(): Promise<MealTemplateType[]> {
        try {
            const response = await fetch(`${API_URLS[0]}/api/meal-templates/types`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch meal template types');
            }

            return data.types;
        } catch (error) {
            console.error('Error fetching meal template types:', error);
            throw error;
        }
    }

    async generatePlan(
        typeId: string,
        targetCalories: number = 2000,
        targetProtein?: number,
        targetCarbs?: number,
        targetFats?: number,
        mealSections?: string[],
        days: number = 14
    ): Promise<any[]> {
        try {
            let url = `${API_URLS[0]}/api/meal-templates/generate/${typeId}?targetCalories=${targetCalories}&days=${days}`;

            if (targetProtein) url += `&targetProtein=${targetProtein}`;
            if (targetCarbs) url += `&targetCarbs=${targetCarbs}`;
            if (targetFats) url += `&targetFats=${targetFats}`;
            if (mealSections && mealSections.length > 0) {
                url += `&mealSections=${mealSections.join(',')}`;
            }

            console.log(`🚀 [MOBILE] Generating ${days}-day plan with URL:`, url);

            const response = await fetch(url);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to generate meal plan');
            }

            return data.plan;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            throw error;
        }
    }
}

export const mealTemplateService = new MealTemplateService();
