function beginWatching()
{
	let totalAds = 0;
	let globalContainer = document.getElementById('globalContainer');
	let filteredPostKeywords = [];
	let hideAds = true;
	let totalTime = 0;
	
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
	
	function mutePosts()
	{
		let startTime = Date.now();
		
		if(hideAds)
		{
			let n = Array.from( globalContainer.querySelectorAll('.uiStreamSponsoredLink') )
				.map(findParentStory)
				.reduce( (prev, next) =>
				{
					if( next.classList.contains('fbFix-muted') )
						return prev;
					
					next.classList.add('fbFix-muted', 'fbFix-muted-ad');
					
					return prev + 1;
				}, 0);
			
			totalAds += n;
			if(n > 0)
				console.log('total ads removed: ' + totalAds);
		}
		
		for(let keyword of filteredPostKeywords)
		{
			// remove comments first so that a comment won't make a whole post disappear
			Array.from( globalContainer.querySelectorAll(".UFIComment") )
				.filter( e => e.textContent.toUpperCase().includes(keyword.toUpperCase()) )
				.reduce( (prev, next) =>
				{
					if( next.classList.contains('fbFix-muted') )
						return prev;
					
					// this means the comment being removed has a reply list which also should be removed
					if( next.nextSibling && next.nextSibling.matches && next.nextSibling.matches('.UFIReplyList') )
						next.nextSibling.classList.add('fbFix-muted', 'fbFix-muted-keyword');
					
					next.classList.add('fbFix-muted', 'fbFix-muted-keyword');
					
					console.log("removed comment containing keyword: " + keyword);
					
					return prev + 1;
				}, 0);
			
			Array.from( globalContainer.querySelectorAll(".userContentWrapper") )
				.filter( e => e.childElementCount == 2 && e.firstElementChild.textContent.toUpperCase().includes(keyword.toUpperCase()) )
				.map(findParentStory)
				.reduce( (prev, next) =>
				{
					if( next.classList.contains('fbFix-muted') )
						return prev;
					
					next.classList.add('fbFix-muted', 'fbFix-muted-keyword');
					console.log("removed post containing keyword: " + keyword);

					return prev + 1;
				}, 0);
		}
		
		let elapsedTime = Date.now() - startTime;
		totalTime += elapsedTime;
		
		//console.log('mute posts cycle took ' + elapsedTime + ' milliseconds');
		//console.log('total time spent muting posts since page load: ' + totalTime + ' milliseconds');
	}
	
	console.log('Watching for ads & keywords...');
	
	let observer = new MutationObserver(mutePosts);
	
	observer.observe(globalContainer, { childList: true, subtree: true });
	
	chrome.storage.sync.get(FbFixKeywordsSettingsKey, result =>
	{
		filteredPostKeywords = result[FbFixKeywordsSettingsKey] || [];
		mutePosts();
	});
	
	chrome.storage.sync.get(FbFixHideAdsSettingsKey, result =>
	{
		hideAds = result[FbFixHideAdsSettingsKey];
		if(hideAds === undefined)
			hideAds = true;
		
		mutePosts();
	});
	
	chrome.storage.onChanged.addListener(function(changes, namespace)
	{
		if(namespace == 'sync')
		{
			let refresh = false;
			
			if(changes[FbFixKeywordsSettingsKey] !== undefined)
			{
				console.log("keywords changed, refreshing...");
				
				filteredPostKeywords = changes[FbFixKeywordsSettingsKey].newValue;
				
				globalContainer.querySelectorAll('.fbFix-muted-keyword')
					.forEach( e => e.classList.remove('fbFix-muted', 'fbFix-muted-keyword') );
				
				refresh = true;
			}
			
			if(changes[FbFixHideAdsSettingsKey] !== undefined)
			{
				console.log("hideAds changed, refreshing...");
				
				hideAds = changes[FbFixHideAdsSettingsKey].newValue;
				
				globalContainer.querySelectorAll('.fbFix-muted-ad')
					.forEach( e => e.classList[hideAds ? 'add' : 'remove']('fbFix-muted') );
				
				totalAds = 0;
			}
			
			if(refresh)
				mutePosts();
		}
	});
	
	// remove initial ads that the observer might have missed (usually one initial ad)
	mutePosts();
	
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
		beginWatching();
	}
}, 100);
