import axios from 'axios';
import { main } from './main';

Promise.all([axios.get(`schema.json`), axios.get(`data.json`)]).then(values => {
	const schema = values[0].data;
	const data = values[1].data;
	main(schema, data);
});

