chrome.storage.sync.get(FbFixHideAdsSettingsKey, hideAds =>
{
	hideAds = hideAds[FbFixHideAdsSettingsKey];
	
	if(hideAds === undefined)
		hideAds = true;
	
	let hideAdsElement = document.getElementById("hideAds");
	
	hideAdsElement.checked = hideAds;
	
	hideAdsElement.addEventListener( "click", e =>
	{
		hideAds = hideAdsElement.checked;
		chrome.storage.sync.set({[FbFixHideAdsSettingsKey]: hideAds});
	});
});

chrome.storage.sync.get(FbFixHideKeywordsSettingsKey, hideKeywords =>
{
	hideKeywords = hideKeywords[FbFixHideKeywordsSettingsKey];
	
	if(hideKeywords === undefined)
		hideKeywords = true;
	
	let hideKeywordsElement = document.getElementById("hideKeywords");
	
	hideKeywordsElement.checked = hideKeywords;
	
	hideKeywordsElement.addEventListener( "click", e =>
	{
		hideKeywords = hideKeywordsElement.checked;
		chrome.storage.sync.set({[FbFixHideKeywordsSettingsKey]: hideKeywords});
	});
});

chrome.storage.sync.get(FbFixKeywordsSettingsKey, keywords =>
{
	keywords = keywords[FbFixKeywordsSettingsKey] || [];
	
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
		
		if( keyword && !new Set(keywords).has(keyword) )
		{
			createKeywordElement(keyword);
			keywords.push(keyword);
		}
		
		keywordInput.value = "";
		
		saveKeywords();
	}

	function saveKeywords()
	{
		chrome.storage.sync.set({[FbFixKeywordsSettingsKey]: keywords});
	}
});
