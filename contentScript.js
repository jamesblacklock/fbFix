function watchForAds()
{
	let total = 0;
	let globalContainer = document.getElementById('globalContainer');
	let filteredPostKeywords = [];
	
	function findParentStory(element)
	{
		let temp = element;
		
		while( temp && !temp.id.startsWith('hyperfeed_story') )
			temp = temp.parentElement;
		
		if(temp == null)
		{
			temp = element;
			
			while( !temp.matches('.userContentWrapper') )
				temp = temp.parentElement;
		}
				
		return temp;
	}
	
	function removeAds()
	{
		let n = Array.from( globalContainer.querySelectorAll('.uiStreamSponsoredLink') )
			.map(findParentStory)
			.reduce( (prev, next) => { next.remove(); return prev + 1; }, 0);
		
		for(let keyword of filteredPostKeywords)
		{
			Array.from( document.querySelectorAll(".userContentWrapper") )
				.filter( e => e.textContent.toUpperCase().includes(keyword.toUpperCase()) )
				.map(findParentStory)
				.reduce( (prev, next) =>
				{
					next.remove();
					console.log("removed post containing keyword: " + keyword);

					return prev + 1;
				}, 0);
		}
		
		total += n;
		if(n > 0)
			console.log('total ads removed: ' + total);
	}
	
	console.log('Watching for ads...');
	
	let observer = new MutationObserver(removeAds);
	
	observer.observe(globalContainer, { childList: true, subtree: true });
	
	chrome.storage.sync.get('keywords', keywords =>
	{
		filteredPostKeywords = keywords.keywords || [];
		removeAds();
	});
	
	// remove initial ads that the observer might have missed (usually one initial ad)
	removeAds();
	
	// clicks the "More Stories" button because after the first ad has been removed,
	// the sroll area is smaller and the button can become visible; more stories need to be loaded
	let moreStories = globalContainer.querySelector('[data-testid=fbfeed_placeholder_story]');
	if(moreStories)
		moreStories = moreStories.nextSibling;
	if(moreStories)
		moreStories.click();
}

var readyStateInterval = setInterval( () =>
{
	if( document.readyState === "complete" && document.getElementById('globalContainer') )
	{
		clearInterval(readyStateInterval);
		watchForAds();
	}
}, 100);