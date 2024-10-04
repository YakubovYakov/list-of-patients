// server.js

const express = require("express");
const { Client } = require("pg");
const path = require("path");

const app = express();
const port = 3000;

// Настройка подключения к базе данных
const client = new Client({
  user: "KIS_ASCLEPIUS_SYNC",
  host: "m11-pgkisc-01", // IP-адрес сервера базы данных
  database: "kis",
  password: "6937D366",
  port: 5432,
});

client.connect();

app.get("/data", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ error: "Неверные или пустые даты" });
    }

    const start = new Date(startDate).toISOString().split("T")[0];
    const end = new Date(endDate).toISOString().split("T")[0];

    console.log(`Получены даты: ${start} - ${end}`);

    const query = `
		SELECT 
		INITCAP(CONCAT_WS(' ',md.surname,md.name,md.patron)) AS pat_fio,
		mm.mdoc_get_num_format(md.num,md.year,md.num_org,md.num_filial,md.num_type,mdtp.id,mdtp.class,'IBN-YYYY-P') as cardnum,
		na.name AS naz_name,
		na.create_dt AS create_dt,
		INITCAP(CONCAT_WS(' ',p_emp_create.surname,p_emp_create.name,p_emp_create.patron)) AS created_by,
		na.sign_dt AS execute_dt,
		INITCAP(CONCAT_WS(' ',p_emp_execute.surname,p_emp_execute.name,p_emp_execute.patron)) AS executed_by,
		d.name naz_create_in,
		ceil(extract(epoch FROM age(na.sign_dt, na.create_dt ))/60) as time_dif
		FROM mm.naz na
		INNER JOIN mm.naz_type nt ON nt.id = na.naz_type_id
		INNER JOIN mm.naz_type_dir ntd ON ntd.id = nt.naz_type_dir_id
		INNER JOIN (SELECT path         
			FROM mm.naz_type_dir nd
			WHERE 'GROUP_CONS' = ANY(tags)                           
								) pa ON pa.path @> ntd.path
		JOIN mm.mdoc md ON md.id=na.mdoc_id
		inner join mm.mdoc_type mdtp ON mdtp.id = md.mdoc_type_id
		JOIN mm.hospdoc hd ON hd.mdoc_id=na.mdoc_id
		JOIN mm.emp e_create ON e_create.id=na.creator_emp_id
		JOIN mm.people p_emp_create ON p_emp_create.id=e_create.people_id
		JOIN mm.emp e_execute ON e_execute.id=na.run_emp_id
		JOIN mm.people p_emp_execute ON p_emp_execute.id=e_execute.people_id
		join mm.dept d on d.id=e_create.dept_id 
		and d.id <> 'efa2f533-bb52-468b-be83-7b205dcb61f8' -- не КДО
		WHERE na.create_dt::DATE BETWEEN $1 and $2 
		and na.sign_dt is not null
		and na.pay_type_id=1 -- только ОМС
		and na.naz_extr_id=1
		order by pat_fio
    `;

    const result = await client.query(query, [start, end]);

    console.log("Результат запроса:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при выполнении запроса:", err);
    res.status(500).json({ error: "Ошибка при выполнении запроса" });
  }
});


// Обслуживание статических файлов (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, "public")));

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
