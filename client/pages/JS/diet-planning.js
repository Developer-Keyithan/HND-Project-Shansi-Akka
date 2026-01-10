// Diet Planning JavaScript
import { Toast } from "../../plugins/Toast/toast.js";
import { API } from "../../shared/api.js";
import { showLoading } from "../../shared/common.js";

function selectPlan(planName) {
    Toast({
        icon: 'info',
        title: 'Plan Selected',
        message: `Proceeding to plan selection: ${planName}`
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('diet-plans-container');
    if (!container) return;

    try {
        // Show loading state
        showLoading(container, 'Loading diet plans...');

        const plans = await API.getDietPlans();

        if (plans && plans.length > 0) {
            container.innerHTML = plans.map(plan => `
                <div class="plan-card" style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.3s; display: flex; flex-direction: column;">
                    <div class="plan-header" style="background: var(--primary-green); color: #fff; padding: 20px; text-align: center;">
                        <h3 style="margin: 0; font-size: 1.5rem;">${plan.name}</h3>
                        <div class="plan-price" style="font-size: 2rem; font-weight: 700; margin-top: 10px;">LKR ${plan.price}<span style="font-size: 1rem; font-weight: 400;">/mo</span></div>
                    </div>
                    <div class="plan-content" style="padding: 30px; flex: 1;">
                        <p style="color: #666; margin-bottom: 20px; text-align: center;">${plan.description}</p>
                        <div class="plan-meta" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 25px; color: #555; font-size: 0.9rem;">
                            <span><i class="fas fa-fire"></i> ${plan.calories} kcal</span>
                            <span><i class="fas fa-calendar"></i> ${plan.duration}</span>
                        </div>
                        <ul class="plan-features" style="list-style: none; padding: 0; margin-bottom: 30px;">
                            ${plan.features.map(feature => `
                                <li style="margin-bottom: 15px; display: flex; align-items: flex-start; gap: 10px;">
                                    <i class="fas fa-check-circle" style="color: var(--primary-green); margin-top: 5px;"></i>
                                    <span>${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                        <div class="plan-footer" style="padding: 0 30px 30px; text-align: center;">
                            <button class="btn btn-primary btn-block select-plan-btn" data-plan="${plan.name}">Choose Plan</button>
                        </div>
                </div>
            `).join('');

            // Add event listeners for buttons
            container.querySelectorAll('.select-plan-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    selectPlan(btn.getAttribute('data-plan'));
                });
            });

        } else {
            container.innerHTML = '<p class="text-center">No diet plans available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading plans:', error);
        container.innerHTML = '<p class="error-text text-center">Failed to load diet plans. Please try again later.</p>';
    }
});
