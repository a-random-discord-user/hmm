const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	let themes;
	if(req.cookies){
		themes = req.cookies["theme"] == 1 ? 1 : 0;
	}else{
		themes = 0;
	}
	res.render('doc.ejs', {
		title: 'Documentation',
		theme: themes
	});
});

module.exports = router;