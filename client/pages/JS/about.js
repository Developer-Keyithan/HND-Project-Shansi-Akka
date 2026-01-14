// About Page JavaScript
import { API } from '../../shared/api.js';
import { showLoading } from '../../shared/common.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Other initializations if any (like animations) can go here

    await loadTeamMembers();
});

async function loadTeamMembers() {
    const container = document.querySelector('.team-grid');
    if (!container) return;

    // Show loading state
    showLoading(container, 'Loading team...');

    try {
        const team = await API.getTeamMembers();

        if (team && team.length > 0) {
            container.innerHTML = team.map(member => `
                <div class="team-member">
                    <div class="member-avatar">
                        <i class="${member.icon || 'fas fa-user'}"></i>
                    </div>
                    <h4>${member.name}</h4>
                    <p class="member-role">${member.role}</p>
                    <p class="member-bio">${member.bio}</p>
                    <!-- <img src="${member.image}" alt="${member.name}" style="display:none;"> --> <!-- Hidden real image fallback -->
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-center col-span-full">No team members found.</p>';
        }

    } catch (error) {
        console.error('Error loading team:', error);
        container.innerHTML = '<p class="error-text text-center col-span-full">Failed to load team members.</p>';
    }
}
