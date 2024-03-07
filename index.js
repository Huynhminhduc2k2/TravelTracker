import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'Hizumi',
  port: 5432,
});

db.connect();

const checkVisisted = async () => {
  const result = await db.query('SELECT country_code FROM visited_countries');
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
};

let errorMessage = '';

app.get('/', async (req, res) => {
  //Write your code here.
  try {
    const countries = await checkVisisted();
    res.render('index.ejs', {
      total: countries.length,
      countries: countries,
      error: errorMessage,
    });
  } catch (error) {
    console.error(error.message);
  }
});

app.post('/add', async (req, res) => {
  try {
    const input = req.body['country'];
    const result = await db.query(
      `SELECT country_code FROM countries WHERE country_name = $1`,
      [input]
    );

    if (result.rows.length !== 0) {
      const data = result.rows[0];
      let countryCode = data.country_code;

      await db.query(`INSERT INTO visited_countries(country_code) VALUES($1)`, [
        countryCode,
      ]);
    } else {
      errorMessage = 'Country does not exist, try again';
    }
  } catch (error) {
    errorMessage = 'Country has already been added, try again';
    console.log(error);
  }
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
