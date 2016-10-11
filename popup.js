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
	
	keywords = keywords.map(kw =>
	{
		if(typeof kw === 'string')
			return {keyword: kw, wholeWord: false};
		else
			return kw;
	});
	
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
		let tr = document.createElement('TR');
		tr.innerHTML =
			`<td>
				<button class="delBtn">&times;</button>
				"<span class="kw">${keyword.keyword}</span>"
			</td>
			<td class="right">
				<input class="wwChk" type='checkbox' ${keyword.wholeWord ? 'checked' : ''}>
			</td>`;
		
		tr.querySelector('.delBtn').addEventListener("click", removeKeyword);
		tr.querySelector('.wwChk').addEventListener("click", setWholeWord);
		
		console.log(keyword);
		keywordsElement.appendChild(tr);
	}
	
	function setWholeWord(e)
	{
		let text = e.target.parentElement.parentElement.querySelector('.kw').textContent;
		
		keywords.find(v => v.keyword === text).wholeWord = e.target.checked;
		
		saveKeywords();
	}

	function removeKeyword(e)
	{
		let keyword = e.target.parentElement.querySelector('.kw').textContent;
		
		e.target.parentElement.parentElement.remove();
		keywords.splice(keywords.findIndex(v => v.keyword === keyword), 1);
		
		saveKeywords();
	}

	function addKeyword()
	{
		let keyword = {keyword: keywordInput.value.trim(), wholeWord: false};
		
		if( keyword.keyword && keywords.findIndex(v => v.keyword === keyword.keyword) < 0 )
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
