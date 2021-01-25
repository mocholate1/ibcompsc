$(document).ready(function(){
    
    // Initialise the mobile sidenav
    let sidenav = document.querySelectorAll('.sidenav');
    let sidenavInstance = M.Sidenav.init(sidenav);
    
    // Initialise form select options
    let selects = document.querySelectorAll('select');
    let selectInstances = M.FormSelect.init(selects);
    
    // Initialise modal for delete buttons
    if ($('.modal')) {
        $('.modal').modal();
    }
    
    // Initialise tooltip for 'like' button
    if ($('.tooltipped')) {
        $('.tooltipped').tooltip();
    }
    
    // gather ingredients from server page render
    let ingredients = [];
    if (document.URL.includes('add_recipe') || document.URL.includes('edit_recipe')) {
        for (let i = 1; i < selects[1].length; i++) {
            ingredients.push(selects[1][i].innerHTML)
        }
    }
    
    // Add button functionality to add additional ingredients
    let ingredientCount = $('.ingredient').length + 1;
    $('.add-ingredient-btn').click(function() {
        let newIngredient = document.createElement('div');
        newIngredient.className = 'ingredient';
        let htmlString = 
            `<div class="input-field col s4">
                <input id="quantity" name="ingredient-qty-${ingredientCount}" type="text" class="validate" autocomplete="off" required>
                <label for="quantity">Quantity</label>
            </div>
            <div class="input-field col s8">
                <select id="ingredient" name="ingredient-name-${ingredientCount}" required>
                    <option value="" disabled selected>Select Ingredient</option>`;
        for (let i = 0; i < ingredients.length; i++) {
            htmlString += `<option value="${ingredients[i]}">${ingredients[i]}</option>`
        }
        htmlString += `</select>
            </div>`;
        newIngredient.innerHTML = htmlString;
        $('.ingredients').append(newIngredient);
        ingredientCount++;
        
        // re-initialise selects on the page
        selects = document.querySelectorAll('select');
        selectInstances = M.FormSelect.init(selects);
    })
    
    // Add button functionality to remove last ingredient
    $('.remove-ingredient-btn').click(function() {
        $('.ingredient').last().remove();
        if (ingredientCount >= 2) {
            ingredientCount--;    
        }
    })
    
    // Add button functionality to add new step in method
    let stepCount = $('.step').length + 1;
    $('.add-step-btn').click(function() {
        let htmlString = `<li class="step">
                            <input name="step-${stepCount}" type="text" class="validate" autocomplete="off" required>
                          </li>`;
        $('#steps-list').append(htmlString);
        stepCount++;
    });
    
    // Add button functionality to remove last step in method
    $('.remove-step-btn').click(function() {
        $('.step').last().remove();
        if (stepCount >= 2) {
            stepCount--;    
        }
    })
    
    // Add 'Like' functionality to like button on recipe page
    $('#like-recipe-btn').on('click', function() {
        
        // check first that there is an active user via the data-user HTML attribute
        if ($('#like-recipe-btn').data('user') !== 'None') {
            
            let activeUser = $('#like-recipe-btn').data('user');
            let recipeId = $('#like-recipe-btn').data('recipe');
            
            // check that receipe is not already liked
            if (!$('#like-recipe-btn').hasClass('like-active')) {
                
                // make call to server to add user to liked_by list in recipe and also to liked_recipes list in user
                $.post(`/add_like/${recipeId}/${activeUser}/`, function(data) {
                    console.log(data);
                    
                    // once server call is successful, add class to colour the button like its active and increase likes count
                    $('#like-recipe-btn').addClass('like-active');
                    $('#likes-count').text(Number($('#likes-count').text()) + 1);
                });
                
            } else {
                
                // if recipe is already liked make call to server to remove user from liked_by list in recipe and remove recipe from liked_recipes list in user
                $.post(`/remove_like/${recipeId}/${activeUser}/`, function(data) {
                    console.log(data);
                    
                    // once server call is successful, remove like-active class to discolour the button and decrease its likes count
                    $('#like-recipe-btn').removeClass('like-active');
                    $('#likes-count').text(Number($('#likes-count').text()) - 1);
                });
            }
        }
    });
    
    
    // --- Pagination Feature ---
    
    let numberOfRecipes = $('.recipe-card').length;
    const pageLimit= 6;
    let totalPages = Math.ceil(numberOfRecipes / pageLimit);

    $(`.recipe-card:gt(${pageLimit - 1})`).hide();

    // configure pagination button links
    $('.pagination').append('<li class="page-number active"><a href="javascript:void(0)">1</a></li>');
    for (let i = 2; i <= totalPages; i++) {
        $('.pagination').append(`<li class="page-number"><a href="javascript:void(0)">${i}</a></li>`);
    }
    $('.pagination').append('<li id="next-page" class="waves-effect"><a href="javascript:void(0)" aria-label="Next"><i class="material-icons">chevron_right</i></a></li>');
    
    // build functionality
    $('.page-number').on('click', function() {
        let currentPage = $(this).index();
        
        if (!$(this).hasClass('active')) {
            $('.pagination li').removeClass('active');
            $(this).addClass('active');
            
            $('.recipe-card').hide();
            
            let grandTotal = pageLimit * currentPage;
            for (let i = grandTotal - pageLimit; i <  grandTotal; i++) {
                $(`.recipe-card:eq(${i})`).show();
            }
            
            if (currentPage > 1 && $('#prev-page').hasClass('disabled')) {
                $('#prev-page').removeClass('disabled');
            } else if (currentPage === 1 && !$('#prev-page').hasClass('disabled')) {
                $('#prev-page').addClass('disabled');
            }
            
            if (currentPage < totalPages && $('#next-page').hasClass('disabled')) {
                $('#next-page').removeClass('disabled');
            } else if (currentPage === totalPages && !$('#next-page').hasClass('disabled')) {
                $('#next-page').addClass('disabled');
            }
        }
    });
    
    $('#next-page').on('click', function() {
        let currentPage = $('.pagination li.active').index();
        if (currentPage != totalPages) {
            currentPage++;
            $('.pagination li').removeClass('active');
            $('.recipe-card').hide();
            let grandTotal = pageLimit * currentPage;
            
            for (let i = grandTotal - pageLimit; i <  grandTotal; i++) {
                $(`.recipe-card:eq(${i})`).show();
            }
            
            $(`.page-number:eq(${currentPage - 1})`).addClass('active');
            
            if ($('.pagination li.active').index() === totalPages) {
                $('#next-page').addClass('disabled');
            }
            if ($('.pagination li.active').index() > 1) {
                $('#prev-page').removeClass('disabled');
            }
        }
    });
    
    $('#prev-page').on('click', function() {
        let currentPage = $('.pagination li.active').index();
        if (currentPage != 1) {
            currentPage--;
            $('.pagination li').removeClass('active');
            $('.recipe-card').hide();
            let grandTotal = pageLimit * currentPage;
            for (let i = grandTotal - pageLimit; i <  grandTotal; i++) {
                $(`.recipe-card:eq(${i})`).show();
            }
            $(`.page-number:eq(${currentPage - 1})`).addClass('active');
            
            
            if ($('.pagination li.active').index() < totalPages) {
                $('#next-page').removeClass('disabled');
            }
            if ($('.pagination li.active').index() === 1) {
                $('#prev-page').addClass('disabled');
            }
        }
    });
    
});