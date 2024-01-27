import { chromium } from 'playwright';
import Exceljs from 'exceljs';
const workbook = new Exceljs.Workbook();

let input = 'StoryGram Academia ';

(async () => {
	// const browser = await chromium.launch({
	// 	headless: false,
	// });

	const browser = await chromium.launchPersistentContext(
		'C:\\Users\\USUARIO\\AppData\\Local\\Google\\Chrome\\User Data\\Default',
		{
			headless: false,
		},
	);

	const page = await browser.newPage();

	await page.goto('https://web.whatsapp.com/');

	await page.click(`[title="${input}"]`, {
		timeout: 100000,
	});

	await page.click(`[title="Profile Details"]`);

	await page.click('.ggj6brxn.ljrqcn24.jq3rn4u7');

	// await page.waitForSelector('[aria-label="Search members"]');
	await page.waitForSelector('[aria-label="Members (36)"]');

	// const chatList = await page.$(
	// 	'[aria-label="Search members"] > [data-animate-modal-popup="true"] > [data-animate-modal-body="true"] > div > div > *:nth-child(3)',
	// );

	const chatList = await page.$(
		'[aria-label="Members (36)"] > [data-animate-modal-popup="true"] > [data-animate-modal-body="true"] > div > div > *:nth-child(3)',
	);

	// Definir una función para extraer datos de los elementos
	const extractData = container => {
		// const elements = container.querySelectorAll(
		// 	'[aria-label="Search members"] > [data-animate-modal-popup="true"] > [data-animate-modal-body="true"] > div > div > *:nth-child(3) > div > div > div > div',
		// );

		const elements = container.querySelectorAll(
			'[aria-label="Members (36)"] > [data-animate-modal-popup="true"] > [data-animate-modal-body="true"] > div > div > *:nth-child(3) > *:nth-child(3) > div > div > div',
		);

		const data = [...elements].map(e => {
			const nameOrNumberElement = e.querySelector(
				'div > div > *:nth-child(2) > *:nth-child(1) > div > div > span',
			);
			const numberElement = e.querySelector(
				'div > div > *:nth-child(2) > *:nth-child(2) > *:nth-child(2) > *:nth-child(1) > span',
			);

			const roleElement = e.querySelector(
				'div > div > *:nth-child(2) > *:nth-child(1) > *:nth-child(2) > div',
			);

			return {
				nameOrNumber: nameOrNumberElement
					? nameOrNumberElement.innerText
					: 'NONE',
				number: numberElement ? numberElement.innerText : 'NONE',
				role: roleElement ? roleElement.innerText : 'user',
			};
		});

		return data;
	};

	// Función para realizar scroll en el elemento
	const scrollElement = async elementHandle => {
		await elementHandle.evaluate(element => {
			element.scrollTop += 100; // Ajusta la cantidad de desplazamiento según tu necesidad
		});
	};

	const resultArray = [];

	while (true) {
		const beforeScroll = await chatList.evaluate(el => el.scrollTop);
		// Scroll en el elemento
		await scrollElement(chatList);

		// Espera un tiempo para que se carguen los elementos después del scroll
		await page.waitForTimeout(1000);

		// Extrae datos después del scroll
		const result = await chatList.evaluate(extractData);

		// Puedes manejar los resultados como desees, por ejemplo, guardarlos en una lista global
		resultArray.push(...result);

		const afterScroll = await chatList.evaluate(el => el.scrollTop);
		const isScrollingFinished = afterScroll === beforeScroll; // Comprueba si el scroll se detuvo

		if (isScrollingFinished) {
			break; // Sale del bucle si el scroll está en el mismo lugar antes y después
		}
	}

	// Muestra el array al final
	console.log(resultArray);

	if (resultArray.length === 0) return;
	const worksheet = workbook.addWorksheet(`Sheet of ${input}`);

	worksheet.addRows(['name or Numbers', 'number', 'role']);

	resultArray.forEach(item => {
		worksheet.addRow([item.nameOrNumber, item.number, item.role]);
	});

	workbook.xlsx
		.writeFile('./sheets/output.xlsx')
		.then(() => {
			console.log('Archivo guardado exitosamente.');
		})
		.catch(error => {
			console.error('Error al guardar el archivo:', error);
		});

	// Cerrar el navegador al finalizar
	// await browser.close();
})();
