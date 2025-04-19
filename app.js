function onClickedEstimateSalary() {
    document.getElementById("first").classList.remove("hidden");

    console.log("Estimate salary button clicked");
    var jobtitle = document.getElementById("uiJobTitle").value;
    var workyear = parseInt(document.getElementById("uiworkyear").value);
    var experiencelvl = $('input[name="experience"]:checked').val();
    var emptype = $('input[name="employment"]:checked').val();
    var remote = parseInt($('input[name="remote"]:checked').val());
    var size = $('input[name="size"]:checked').val();
    var companylocs = document.getElementById("uicompanylocs").value;
    var currency = document.getElementById("uicurrency").value;
    var empresidence = document.getElementById("uiempresidence").value;

    if (companylocs.trim() === "United States") {
        companylocs = "US";
    }

    if (empresidence.trim() === "United States") {
        empresidence = "US";
    }

    console.log(jobtitle, workyear, experiencelvl, emptype, remote, size, companylocs, currency, empresidence)

    // var url = "http://127.0.0.1:8000/predict-dsjobs-salaries"; // if not using nginx
    // var url = "/api/predict-dsjobs-salaries";
    // var url = "https://web-production-57984.up.railway.app/predict-dsjobs-salaries"
    
    var url = "https://datapay.pythonanywhere.com/predict-dsjobs-salaries"

    const jobTitleImages = {
        "Data Scientist": "images/job_thumbnails/ds.jpg",
        "Data Analyst": "images/job_thumbnails/da.jpg",
        "Data Engineer": "images/job_thumbnails/de.jpg",
        "Business Intelligence Specialist": "images/job_thumbnails/bi.jpg",
        "Machine Learning Engineer": "images/job_thumbnails/ml.jpg",
        "AI Engineer": "images/job_thumbnails/ai.jpg",
        "Software Engineer": "images/job_thumbnails/se.jpg",
        "IT Manager": "images/job_thumbnails/lead.jpg",
    };

    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            work_year: workyear,
            experience_level: experiencelvl,
            employment_type: emptype,
            job_title: jobtitle,
            salary_currency: currency,
            employee_residence: empresidence,
            remote_ratio: remote,
            company_location: companylocs,
            company_size: size
        }),
        success: function (data) {
            var imagePath = jobTitleImages[jobtitle] ;
            document.querySelector(".jobthumbnail img").src = imagePath;

            document.querySelector(".jobtitle").innerText = jobtitle;

            document.querySelector(".description").innerText = generateCorrelatedSalaryReason(jobtitle, workyear, experiencelvl, emptype, remote, size, companylocs, currency, empresidence);

            document.querySelector(".salarytxt").innerHTML =
                "<h3><strong>Salary:</strong> USD $ " + data.estimated_salary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "</h3>";

        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText || status);
        }
    });
}

document.getElementById("predictForm").addEventListener("submit", function (event) {
    event.preventDefault(); 
    onClickedEstimateSalary();
});



$(document).ready(function () {
    console.log("document loaded");

    function populateSelect(url, selectId, defaultText, addOther = false) {
        $.get(url, function(data, status) {
            console.log(`got response for ${url} request`, data);
            if (data) {
                // Get the key dynamically (e.g., job_titles, currency, etc.)
                const key = Object.keys(data)[0];
                const items = data[key];
                
                const $select = $(selectId);
                $select.empty();
                $select.append(new Option(`- ${defaultText} -`, ""));

                items.forEach(function(item) {
                    $select.append(new Option(item, item));
                });

                if (addOther) {
                    $select.append(new Option("-- Other --", "-- Other --"));
                }
            }
        });
    }

    populateSelect('https://datapay.pythonanywhere.com/get_job_titles', "#uiJobTitle", "Job title");
    populateSelect("https://datapay.pythonanywhere.com/get_company_locations", "#uicompanylocs", "Location", true);
    populateSelect("https://datapay.pythonanywhere.com/get_currency", "#uicurrency", "Currency", true);
    populateSelect("https://datapay.pythonanywhere.com/get_work_year", "#uiworkyear", "Work year");
    populateSelect("https://datapay.pythonanywhere.com/get_employee_residence", "#uiempresidence", "Residence");

    // populateSelect("http://127.0.0.1:8000/get_job_titles", "#uiJobTitle", "Job title");
    // populateSelect("http://127.0.0.1:8000/get_company_locations", "#uicompanylocs", "Location", true);
    // populateSelect("http://127.0.0.1:8000/get_currency", "#uicurrency", "Currency", true);
    // populateSelect("http://127.0.0.1:8000/get_work_year", "#uiworkyear", "Work year");
    // populateSelect("http://127.0.0.1:8000/get_employee_residence", "#uiempresidence", "Residence");
});

function generateCorrelatedSalaryReason(jobtitle, workyear, experiencelvl, emptype, remote, size, companylocs, currency, empresidence) {
    let reasons = [];

    // Experience Level
    if (experiencelvl === "EN") {
        reasons.push(`Entry-level roles have lower pay due to limited responsibility.`);
    } else if (experiencelvl === "MI") {
        reasons.push(`Mid-level roles earn more for balancing tasks and teamwork.`);
    } else if (experiencelvl === "SE") {
        reasons.push(`Senior roles are paid more for leadership and strategy.`);
    } else if (experiencelvl === "EX") {
        reasons.push(`Experts earn highly for specialized and critical work.`);
    }

    // Employment Type
    if (emptype === "FT") {
        reasons.push(`Full-time jobs offer stable pay and benefits.`);
    } else if (emptype === "PT") {
        reasons.push(`Part-time roles pay less due to fewer hours.`);
    } else if (emptype === "CT") {
        reasons.push(`Contract roles may pay more to offset instability.`);
    } else if (emptype === "FL") {
        reasons.push(`Freelance work pays per project, with less stability.`);
    }

    // Remote Setup
    if (remote === 100) {
        reasons.push(`Remote roles can offer global-market salaries.`);
    } else if (remote === 50) {
        reasons.push(`Hybrid setups balance local and remote pay scales.`);
    } else if (remote === 0) {
        reasons.push(`Onsite jobs follow local cost of living standards.`);
    }

    // Company Size
    if (size === "S") {
        reasons.push(`Small firms pay less but offer diverse tasks.`);
    } else if (size === "M") {
        reasons.push(`Mid-sized firms balance pay with growth.`);
    } else if (size === "L") {
        reasons.push(`Large companies offer structured, often higher pay.`);
    }

    // Location Factors
    if (companylocs) {
        reasons.push(`Being in ${companylocs} affects pay due to market norms.`);
    }
    if (empresidence && empresidence !== companylocs) {
        reasons.push(`Different employee location may adjust pay for cost of living.`);
    }

    // Currency
    if (currency) {
        reasons.push(`Pay in ${currency} reflects local financial standards.`);
    }

    // Limit to 4 sentences
    const selectedReasons = reasons.slice(0, 4).join(' ');

    return `The salary for a ${jobtitle} in ${workyear} depends on factors like: ${selectedReasons}`;
}
