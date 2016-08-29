

chrome.storage.sync.get('hideAds', hideAds =>
{
	hideAds = hideAds.hideAds;
	
	if(hideAds === undefined)
		hideAds = true;
	
	let hideSponsored = document.getElementById("hideSponsored");
	
	hideSponsored.addEventListener( "click", e =>
	{
		hideAds = e.target.checked;
		chrome.storage.sync.set({'hideAds': hideAds});
	});
	
	hideSponsored.checked = hideAds;
});

chrome.storage.sync.get('keywords', keywords =>
{
	keywords = keywords.keywords || [];
	
	let keywordsElement = document.getElementById("keywords");
	let addKeywordElement = document.getElementById("addKeyword");
	let keywordInput = document.getElementById("keywordInput");
	
	addKeywordElement.addEventListener("click", addKeyword);
	
	keywordInput.addEventListener( "keyup", e =>
	{
		let code = e.keyCode ? e.keyCode : e.which;
		console.log(code);
		if(code == 13)
			addKeyword();
	});
	
	
	for(let keyword of keywords)
		createKeywordElement(keyword);

	
	function createKeywordElement(keyword)
	{
		let div = document.createElement('DIV');
		div.innerHTML = `<button>&times;</button> "${keyword}"`;
		div.firstChild.addEventListener("click", removeKeyword);
		
		keywordsElement.appendChild(div);
	}

	function removeKeyword(e)
	{
		let keyword = e.target.parentElement.textContent.substr(3).slice(0, -1);
		
		e.target.parentElement.remove();
		keywords.splice(keywords.findIndex(v => v === keyword), 1);
		
		saveKeywords();
	}

	function addKeyword()
	{
		let keyword = keywordInput.value.trim();
		
		if(keyword)
		{
			createKeywordElement(keyword);
			keywords.push(keyword);
		}
		
		keywordInput.value = "";
		
		saveKeywords();
	}

	function saveKeywords()
	{
		chrome.storage.sync.set({'keywords': keywords});
	}
});
