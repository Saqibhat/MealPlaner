class MealPlanner {
    constructor() {

        this.editMeal = this.editMeal.bind(this);
        this.saveMeal = this.saveMeal.bind(this);
        this.deleteMeal = this.deleteMeal.bind(this);
        this.showIngredients = this.showIngredients.bind(this);//this.toggleIngredients = this.toggleIngredients.bind(this);

        this.renderMeals = this.renderMeals.bind(this);
        this.showAddIngredientModal = this.showAddIngredientModal.bind(this);
        this.saveIngredient = this.saveIngredient.bind(this);
        this.deleteIngredient = this.deleteIngredient.bind(this)
        this.currentUser = localStorage.getItem('username');
        this.currentMealType = localStorage.getItem('mealType') //|| 'frokost';
        //  //this.meals = [];
        this.initEventListeners();
        this.loadMeals();
        this.loadWeekPlan();
        // this.showIngredients = this.showIngredients.bind(this);
        this.renderMeals = this.renderMeals.bind(this);

        // Initialiser data eller DOM-elementer
        //this.meals = [];
       
        this.mealsContainer = document.getElementById('meals-container');  
    }



    /// darkmode

    initDarkMode() {
    // Sjekk lagret tema eller bruk light mode som standard
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);

    // Oppdater toggle-knappen
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'dark';
        
        // Lytt etter endringer
        themeSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            this.setTheme(newTheme);
            this.applyTheme(newTheme); // Ny metode for å påvirke hele siden
        });
    }
}

setTheme(theme) {
    // Lagre i localStorage
    localStorage.setItem('theme', theme);
    
    // Sett data-attributt på html-elementet
    document.documentElement.setAttribute('data-theme', theme);
    
    // Debug logging
    console.log(`Theme satt til: ${theme}`);
}

applyTheme(theme) {
    // Manuelt oppdater bakgrunnsfarge hvis nødvendig
    document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#e0e0e0' : '#333';
    
    // Oppdater alle kort
    document.querySelectorAll('.meal-card').forEach(card => {
        card.style.backgroundColor = theme === 'dark' ? '#2d2d2d' : '#ffffff';
    });
    
    console.log(`Tema applisert: ${theme}`);
}


    initEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
  
            btn.addEventListener('click', () => {

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');


                this.currentMealType = btn.dataset.type;
                localStorage.setItem('mealType', this.currentMealType);
                 this.loadMeals();
            });

        });

        
        // legge  til måltid  knapp
        document.getElementById('add-meal-btn').addEventListener('click', () => {
            this.showMealModal();
        });
        // måltid skjema
        document.getElementById('meal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeal();
        });
        document.getElementById('ingredient-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIngredient(e);
        });
        //planleggingsmodal

        document.getElementById('plan-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const mealId = document.getElementById('plan-meal-id').value;
            const day = document.getElementById('plan-day').value;
            const mealType = document.getElementById('plan-meal-type').value;
            this.addToPlan(mealId, day, mealType);
            document.getElementById('plan-modal').style.display = 'none';
        });
        // Event delegation for dynamiske knapper
        document.addEventListener('click', (e) => {

            if (e.target.classList.contains('edit-btn')) {
                e.preventDefault();
                this.editMeal(e.target.dataset.id);
            }


            if (e.target.classList.contains('delete-btn')) {
                e.preventDefault();
                this.deleteMeal(e.target.dataset.id);
            }


            if (e.target.classList.contains('add-to-plan-btn')) {
                e.preventDefault();
                this.showAddToPlanModal(e.target.dataset.id);
            }

            if (e.target.classList.contains('show-ingredients')) {
                e.preventDefault();
                this.showIngredients(e.target.dataset.id);
            }
            if (e.target.classList.contains('btn-add-ingredient')) {
                e.preventDefault();
                this.showAddIngredientModal(e.target.dataset.id);
            }
            if (e.target.classList.contains('btn-delete-ingredient')) {
                e.preventDefault();
                this.deleteIngredient(e.target.dataset.id);
            }


           
        });

        
        // lukk modaler
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('meal-modal').style.display = 'none';
            document.getElementById('plan-modal').style.display ='none';
            document.getElementById('ingredient-modal').style.display = 'none';

        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('meal-modal')) {
                document.getElementById('meal-modal').style.display = 'none';
               
            }
        });
    }

    async loadMeals() {
        try {
            //ensure consistent case for meal type
            const mealType = this.currentMealType.toLowerCase();

            const response = await fetch(`/api/meals?type=${this.currentMealType}`);
            if (!response.ok) throw new Error('Failed to load meals');
            
            const meals = await response.json();
            console.log('Loaded meals:', meals); // Debug log


            // Filter meals by type (double check)
        const filteredMeals = meals.filter(meal => 
            meal.type.toLowerCase() === mealType
        );



            this.renderMeals(meals);
        } catch (error) {
            console.error('Error loading meals:', error);
            alert('Could not load meals. Please try again.');
        }
    }



  renderMeals(meals) {
    const container = document.getElementById('meal-list');
    container.innerHTML = meals.map(meal => `
        <div class="meal-card" data-id="${meal.mealid}">
            <h3>${meal.title}</h3>
            <p>${meal.description || 'Ingen beskrivelse'}</p>
            <div class="meal-actions">
                <button class="btn-edit edit-btn" data-id="${meal.mealid}">Rediger</button>
                <button class="btn-delete delete-btn" data-id="${meal.mealid}">Slett</button>
                <button class="btn-add-to-plan add-to-plan-btn" data-id="${meal.mealid}">Legg til i plan</button>
                <button class="show-ingredients" data-id="${meal.mealid}">
                    ${document.getElementById(`ingredients-${meal.mealid}`)?.style.display === 'block' ? 'Skjul ingredienser' : 'Vis ingredienser'}
                </button>
            </div>
            <div class="ingredients-container" id="ingredients-${meal.mealid}" style="display:none;">
                <div class="ingredients-list" id="ingredients-list-${meal.mealid}"></div>
                <button class="btn-add-ingredient" data-id="${meal.mealid}">
                    + Legg til ingrediens
                </button>
            </div>
        </div>
    `).join('');
    
    // Resten av din eksisterende kode...




        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.editMeal(e.target.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteMeal(e.target.dataset.id));
        });

        document.querySelectorAll('.add-to-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showAddToPlanModal(e.target.dataset.id));
        });



        document.querySelectorAll('.show-ingredients').forEach(btn => {
            btn.addEventListener('click', (e) => 
                this.showIngredients(e.target.dataset.id));
            
        });

        document.querySelectorAll('.btn-add-ingredient').forEach(btn => {
            btn.addEventListener('click', (e) => 
                this.showAddIngredientModal(e.target.dataset.id));
            
        });

    }


    async loadWeekPlan() {
        try {
            const response = await fetch('/api/user-meals');
            if (!response.ok) throw new Error('Failed to load week plan');
            

            const plannedMeals = await response.json();

            this.renderWeekPlan(plannedMeals);
        } catch (error) {
            console.error('Error loading week plan:', error);
            alert('Could not load week plan. Please try again.');
        }
    }

    renderWeekPlan(plannedMeals) {
    const weekGrid = document.getElementById('week-grid');

    const days = ['man', 'tir', 'ons', 'tor', 'fre', 'lør', 'søn'];
    const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    const mealTypes = ['frokost', 'lunsj', 'middag'];
    const mealTypeNames = { frokost: 'Frokost', lunsj: 'Lunsj', middag: 'Middag' };
  //  const icons = { frokost: '☀️', lunsj: '🌞', middag: '🌙' };
   //  <strong>${icons[type]} ${meal.title}</strong>  //undere html +
    // Start bygging av tabell
    let html = '<table class="week-table">';
    html += '<thead><tr><th></th>';
    dayNames.forEach(dayName => {
        html += `<th>${dayName}</th>`;
    });
    html += '</tr></thead><tbody>';

    mealTypes.forEach(type => {
        html += `<tr><td><strong>${mealTypeNames[type]}</strong></td>`;
        days.forEach(day => {
            const meals = plannedMeals.filter(meal => meal.day === day && meal.meal_type === type);
            html += '<td>';
            meals.forEach(meal => {
                html += `
                    <div class="planned-meal" data-plan-id="${meal.id}">
                       
                        <strong>${mealTypeNames[type]} ${meal.title}</strong>

                        <p>${meal.description || ''}</p>
                        <button class="btn-delete remove-plan-btn" data-plan-id="${meal.id}">Fjern</button>
                    </div>
                `;
            });
            html += '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    weekGrid.innerHTML = html;

    // Aktiver knapper for å fjerne planlagte måltider
    document.querySelectorAll('.remove-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.removeFromPlan(e.target.dataset.planId));
    });
}

    showMealModal(mealId = null) {
        const modal = document.getElementById('meal-modal');
        const form = document.getElementById('meal-form');
        
        if (mealId) {
            document.getElementById('modal-title').textContent = 'Rediger måltid';
            document.getElementById('meal-id').value = mealId;
            this.fillEditForm(mealId);
        } else {
            document.getElementById('modal-title').textContent = 'Legg til nytt måltid';
            document.getElementById('meal-id').value = '';
            document.getElementById('meal-type').value = this.currentMealType;
            form.reset();

        }

        
        modal.style.display = 'block';
    }

    async editMeal(mealId) {
        try {
            const response = await fetch(`/api/meals/${mealId}`);
            if (!response.ok) throw new Error('Failed to load meal data');
            
            const meal = await response.json();
            //fyll ut skjemaet
            document.getElementById('meal-id').value = meal.mealid;
            document.getElementById('meal-title').value = meal.title;
            document.getElementById('meal-desc').value = meal.description || '';
            document.getElementById('meal-type').value = meal.type;

            //oppdater modal tittel og vis

            document.getElementById('modal-title').textContent = 'Rediger måltid';
            document.getElementById('meal-modal').style.display = 'block';

        } catch (error) {
            console.error('Error loading meal data:', error);
            this.showAlert('Kunne ikke åpne for redigering: ' + error.message, 'error');
            
        }
    }

    async saveMeal() {
        const mealId = document.getElementById('meal-id').value;
        const isEdit = !!mealId;
        
        const mealData = {
            title: document.getElementById('meal-title').value,
            description: document.getElementById('meal-desc').value,
            type: document.getElementById('meal-type').value
        };

        try {
            const url = isEdit ? `/api/meals/${mealId}` : '/api/meals';
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mealData)
            });

            if (!response.ok) throw new Error('Failed to save meal');

            document.getElementById('meal-modal').style.display = 'none';
            this.loadMeals();
        } catch (error) {
            console.error('Error saving meal:', error);
            this.showAlert('Kunne ikke lagre måltid: ' + error.message, 'error');
        }
    }

    async deleteMeal(mealId) {
        if (!confirm('Er du sikker på at du vil slette dette måltidet?')) return;
        
        try {
            const response = await fetch(`/api/meals/${mealId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete meal');

            this.loadMeals();
            this.loadWeekPlan();
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('Could not delete meal. Please try again.');
        }
    }



    async showIngredients(mealId) {
    const container = document.getElementById(`ingredients-${mealId}`);
    const list = document.getElementById(`ingredients-list-${mealId}`);
    
    // Toggle visning
    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/api/meals/${mealId}/ingredients`);
        if (!response.ok) throw new Error('Kunne ikke laste ingredienser');
        
        const ingredients = await response.json();
        
        if (ingredients.length === 0) {
            list.innerHTML = '<p>Ingen ingredienser lagt til</p>';
        } else {
            list.innerHTML = ingredients.map(ing => `
                <div class="ingredient-item" data-id="${ing.ingredient_id}">
                    <span>${ing.amount} ${ing.unit} ${ing.name}</span>
                    <button class="btn-delete-ingredient" data-id="${ing.ingredient_id}">Slett</button>
                </div>
            `).join('');
        }
        
        container.style.display = 'block';
    } catch (error) {
        console.error('Feil:', error);
        list.innerHTML = '<p>Kunne ikke laste ingredienser</p>';
        container.style.display = 'block';
    }
}



 


    showAddIngredientModal(mealId) {

        const modal = document.getElementById('ingredient-modal');
        if (!modal) {
            console.error('Ingredient modal not found in DOM');
            return;
        }


        document.getElementById('ingredient-meal-id').value = mealId;
        document.getElementById('ingredient-form').reset();
        document.getElementById('ingredient-id').value = '';
        document.getElementById('ingredient-modal-title').textContent = 'Legg til ny ingrediens';
        document.getElementById('ingredient-modal').style.display = 'block';


        // Aktiver skjema-validering
        const form = document.getElementById('ingredient-form');
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const isFormValid = form.checkValidity();
                document.getElementById('save-ingredient-btn').disabled = !isFormValid;
            });
        });
    }



   async saveIngredient(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lagrer...';

        
        try {
            // Hent skjemadata
            const formData = {
                mealid: document.getElementById('ingredient-meal-id').value,
                name: document.getElementById('ingredient-name').value,
                amount: parseFloat(document.getElementById('ingredient-amount').value),
                unit: document.getElementById('ingredient-unit').value
            };

            // Valider input
            if (!formData.name || isNaN(formData.amount) || !formData.unit) {
                throw new Error('Vennligst fyll ut alle feltene korrekt');
            }

            // Send til backend
            const response = await fetch(`/api/meals/${formData.mealid}/ingredients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Kunne ikke lagre ingrediens');
            }

            // Suksess - skjul modal og oppdater liste
            document.getElementById('ingredient-modal').style.display = 'none';
 
            this.showIngredients(formData.mealid);
            this.showAlert('Ingrediens lagret!', 'success');
            
        } catch (error) {
            console.error('Feil:', error);
            this.showAlert(error.message, 'error');
        } finally {
            // Tilbakestill knapp
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }

    }

    async deleteIngredient(ingredientId) {
        if (!confirm('Er du sikker på at du vil slette denne ingrediensen?')) return;

        try {
            const response = await fetch(`/api/ingredients/${ingredientId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Kunne ikke slette ingrediens');

            // Finn måltid-ID for å oppdatering visningen
            const mealId = document.querySelector(`.ingredient-item[data-id="${ingredientId}"]`)
                .closest('.ingredients-container').id.replace('ingredients-', '');
            this.showIngredients(mealId);
        } catch (error) {
            console.error('Feil:', error);
            alert('Kunne ikke slette ingrediens: ' + error.message);
        }
    }
    

    showAddToPlanModal(mealId) {
        // In a real implementation, this would show a modal to select day/meal type
        // For simplicity, we'll just add to Monday breakfast
        //this.addToPlan(mealId, 'man', 'frokost');
        //Når brukeren klikker på “Legg til i plan”-knappen:
        const modal = document.getElementById('plan-modal');
        const form = document.getElementById('plan-form');

        // Fyll inn skjult input med valgt måltid-ID

        document.getElementById('plan-meal-id').value = mealId;
    
    // Reset form
   // document.getElementById('plan-day').value = 'man';
    //document.getElementById('plan-type').value = 'frokost';
    
    // Vis modal
    modal.style.display = 'block';
    
    // Skjul modalen ved X eller klikk utenfor
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    }
    

//Send skjemaet (legg til måltid i ukeplan)

    document.getElementById('plan-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Hindrer vanlig form-innsending

        const mealId = document.getElementById('plan-meal-id').value;
        const day = document.getElementById('plan-day').value;
        const mealType = document.getElementById('plan-type').value;
        
        this.addToPlan(mealId, day, mealType);
        modal.style.display = 'none';
    });
    }
   //Sender POST-forespørsel til Flask-backend med JSON-data. Dette er det som legger måltidet til databasen i meal_plan.  
   
   async addToPlan(mealId, day, mealType) {
        try {
            const response = await fetch('/api/user-meals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mealid: mealId,
                    day: day,
                    meal_type: mealType
                })
            });
            const result = await response.json();

            if (!response.ok) throw new Error('Failed to add to plan');

            // oppdater ukeplanen i brukergrensesnittet med nyeste data.


            await this.loadWeekPlan();

            //vis bekreftelse melding
            this.showAlert('Måltid lagt til planen', 'success')
            return true;

//Logger og viser feilmelding hvis noe går galt.

        } catch (error) {
            console.error('Error adding to plan:', error);
            alert('Could not add to plan. Please try again.');
        }
    }

    async removeFromPlan(planId) {
        if (!confirm('Er du sikker på at du vil fjerne dette måltidet fra planen?')) return;
        
        try {
            const response = await fetch(`/api/user-meals/${planId}`, {
                method: 'DELETE',
                headers:{
                    'content-Type': 'application/json'
                }
            });
            const result = await response.json();

            if (!response.ok) throw new Error('Failed to remove from plan');
//oppdater ukeplanen

        await this.loadWeekPlan();
        } catch (error) {
            console.error('Error removing from plan:', error);
            alert('kunn ikke fjerne måltid. Please try again.');
        }
    }
}
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/') {
        new MealPlanner();   
   
    }
 });

 // Global functions for backwards compatibility
function addSampleData() {
    console.log('Sample data functionality would need to be implemented on the server side');
}

function clearAllData() {
    if (confirm('Dette vil slette alle dine måltider og ukeplaner. Er du sikker?')) {
        console.log('Clear data functionality would need to be implemented on the server side');
    }
}

// Global function to toggle dark mode (for external access)
function toggleDarkMode() {
    if (window.mealPlanner) {
        return window.mealPlanner.toggleTheme();
    }
}