// index.js
// import { Chart } from "chart.js";

// Форматирование даты
const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

// Запрос данных с сервера и отрисовка в таблице
function getDataAndRenderTable() {
  console.log("Запрашиваем данные с сервера...");

  fetch("/data")
    .then((response) => response.json())
    .then((data) => {
      console.log("Получены данные:", data);

      const sortedData = data.sort(
        (a, b) => new Date(a.create_dt) - new Date(b.create_dt)
      );
      renderTable(data);
    })
    .catch((error) => console.error("Ошибка:", error));
}

// Вычисление разницы во времени в минутах
function getTimeDifferenceInMinutes(createDate, executeDate) {
  const createTime = new Date(createDate).getTime();
  const executeTime = new Date(executeDate).getTime();

  const diffInMs = executeTime - createTime;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  return diffInMinutes;
}

// Отрисовка таблицы
function renderTable(data) {
  const tbody = document.getElementById("data-table-body");
  tbody.innerHTML = "";

  data.forEach((item) => {
    const timeDiff = getTimeDifferenceInMinutes(
      item.create_dt,
      item.execute_dt
    );

    const row = document.createElement("tr");

    // Окрашивание строк
		if (timeDiff < 0) {
      row.style.backgroundColor = "lightblue"; 
    } else if (timeDiff >= 0 && timeDiff < 30) {
      row.style.backgroundColor = "lightyellow";
    } else if (timeDiff >= 30 && timeDiff <= 120) {
      row.style.backgroundColor = "yellow";
    } else if (timeDiff > 120) {
      row.style.backgroundColor = "red";
    }

    row.innerHTML = `
      <td>${item.pat_fio}</td>
			<td>${item.cardnum}</td>
      <td>${item.naz_name}</td>
      <td>${formatDateTime(item.create_dt)}</td>
      <td>${item.created_by}</td>
      <td>${formatDateTime(item.execute_dt)}</td>
      <td>${item.executed_by}</td>
			<td>${item.naz_create_in}</td>
      <td>${timeDiff} минут</td>
    `;

    tbody.appendChild(row);
  });
}

// Фильтрация по дате
document.getElementById("filter-button").addEventListener("click", () => {
  const startDateInput = document.getElementById("start-date").value;
  const endDateInput = document.getElementById("end-date").value;

  if (!startDateInput || !endDateInput) {
    alert("Пожалуйста, заполните обе даты!");
    return;
  }

  const startDate = new Date(startDateInput).toISOString().split("T")[0];
  const endDate = new Date(endDateInput).toISOString().split("T")[0];

  fetch(`/data?startDate=${startDate}&endDate=${endDate}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((filteredData) => {
      const sortedData = filteredData.sort(
        (a, b) => new Date(a.create_dt) - new Date(b.create_dt)
      );
      renderTable(filteredData);
    })
    .catch((error) => console.error("Ошибка:", error));
});

// Отрисовка графика
// const renderChart = () => {
//   const labels = data.map((item) => formatDateTime(item.create_dt));
//   const timeDiffs = data.map((item) =>
//     getTimeDifferenceInMinutes(item.create_dt, item.execute_dt)
//   );

//   const ctx = document.getElementById("myChart").getContext("2d");
//   new Chart(ctx, {
//     type: "line",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Ожидание приема ( в минутах )",
//           data: timeDiffs,
//           backgroundColor: "rgba(72, 192, 192, 0.2)",
//           borderColor: "rgba(75, 192, 192, 1)",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     },
//   });
// };
