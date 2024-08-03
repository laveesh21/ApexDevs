import Express from 'express'


const app = Express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(Express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

