

chrome.storage.sync.get('keywords', keywords =>
{
	keywords = keywords.keywords || [];
	
	let keywordsElement = document.getElementById("keywords");
	
	for(let keyword of keywords)
		createKeywordElement(keyword);

	let addKeywordElement = document.getElementById("addKeyword");

	addKeywordElement.addEventListener("click", addKeyword);

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
		let keywordInput = document.getElementById("keywordInput");
		let keyword = keywordInput.value;
		
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
