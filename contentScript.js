function fixAdSidebar(setting)
{
	let adSidebar = document.getElementById('pagelet_ego_pane');
	if(adSidebar)
	{
		adSidebar.classList.add('fbFix-muted-ad');
		
		if(setting === undefined)
			adSidebar.classList.add('fbFix-muted');
		else if(setting === false)
			adSidebar.classList.remove('fbFix-muted');
	}
	
	Array.from( globalContainer.querySelectorAll('.uiHeaderTitle > .adsCategoryTitleLink') )
		.map(element =>
		{
			while( element && !element.classList.contains('ego_column') )
				element = element.parentElement;
			
			return element;
		})
		.reduce( (prev, next) =>
		{
			next.classList.add('fbFix-muted-ad');
			
			return prev + 1;
		}, 0);
}

function regExEscape(s)
{
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function beginWatching()
{
	let totalAds = 0;
	let globalContainer = document.getElementById('globalContainer');
	let filteredPostKeywords = [];
	let hideAds;
	let hideKeywords;
	let totalTime = 0;
	
	function findParentStory(element)
	{
		while( element && !element.matches('._4-u2._4-u8.mbm') )
			element = element.parentElement;
		
		return element;
	}
	
	function hideAdSidebar()
	{
		let adSidebar = document.getElementById('pagelet_ego_pane');
		if(adSidebar)
			adSidebar.classList.add('fbFix-muted', 'fbFix-muted-ad');
		
		Array.from( globalContainer.querySelectorAll('.uiHeaderTitle > .adsCategoryTitleLink') )
			.map(element =>
			{
				while( element && !element.classList.contains('ego_column') )
					element = element.parentElement;
				
				return element;
			})
			.reduce( (prev, next) =>
			{
				if( next.classList.contains('fbFix-muted') )
					return prev;
				
				next.classList.add('fbFix-muted', 'fbFix-muted-ad');
				
				return prev + 1;
			}, 0);
	}
	
	function mutePosts()
	{
		let startTime = Date.now();
		
		fixAdSidebar(hideAds);
		
		if(hideAds)
		{
			hideAdSidebar();
			
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
		
		if(hideKeywords)
		{
			let trendingItem = document.getElementById('browse:independent:modules:pagelet');
			if(trendingItem)
				trendingItem.classList.removeClass('fbFix-muted', 'fbFix-muted-keyword');
			
			for(let keywordSetting of filteredPostKeywords)
			{
				let {keyword, wholeWord} = 
						typeof keywordSetting === 'string' ?
						{keyword: keywordSetting, wholeWord: false} :
						keywordSetting;
				
				let regex = wholeWord ? 
						RegExp("\\b" + regExEscape(keyword) + "\\b", "i") : 
						RegExp(".*" + regExEscape(keyword) + ".*", "i");
				
				// remove comments first so that a comment won't make a whole post disappear
				Array.from( globalContainer.querySelectorAll(".UFIComment") )
					.filter( e => regex.test(e.textContent) )
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
				
				Array.from( globalContainer.querySelectorAll(".userContentWrapper, .userContentWrapper > div > div > h5") )
					.filter( e =>
						(e.childElementCount == 2 && regex.test(e.firstElementChild.textContent)) ||
						(e.matches('.userContentWrapper > div > div > h5') && regex.test(e.textContent)) )
					.map(findParentStory)
					.reduce( (prev, next) =>
					{
						if( next.classList.contains('fbFix-muted') )
							return prev;
						
						next.classList.add('fbFix-muted', 'fbFix-muted-keyword');
						console.log("removed post containing keyword: " + keyword);
	
						return prev + 1;
					}, 0);
				
				// scan treding topics
				Array.from( globalContainer.querySelectorAll("li[data-topicid]") )
					.filter( e => regex.test(e.textContent) )
					.reduce( (prev, next) =>
					{
						if( next.classList.contains('fbFix-muted') )
							return prev;
						
						next.classList.add('fbFix-muted', 'fbFix-muted-keyword');
						console.log("removed trending topic containing keyword: " + keyword);
						
						return prev + 1;
					}, 0);
				
				if(trendingItem && !trendingItem.classList.contains('fbFix-muted'))
				{
					if( regex.test(trendingItem.textContent) )
					{
						trendingItem.classList.addClass('fbFix-muted', 'fbFix-muted-keyword');
						console.log("trending topic page header containing keyword: " + keyword);
					}
				}
			}
		}
		
		setTimeout(
		() => {
			document.querySelectorAll("._4-u2._4-u8.mbm:not(.fbFix-scanned),#pagelet_trending_tags_and_topics")
					.forEach( x => x.classList.add('fbFix-scanned') );
		}, 20);
		
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
	
	chrome.storage.sync.get(FbFixHideKeywordsSettingsKey, result =>
	{
		hideKeywords = result[FbFixHideKeywordsSettingsKey];
		if(hideKeywords === undefined)
			hideKeywords = true;
		
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
				filteredPostKeywords = changes[FbFixKeywordsSettingsKey].newValue;
				
				console.log("keywords=" + filteredPostKeywords + ", refreshing...");
				
				globalContainer.querySelectorAll('.fbFix-muted-keyword')
					.forEach( e => e.classList.remove('fbFix-muted', 'fbFix-muted-keyword') );
				
				refresh = true;
			}
			
			if(changes[FbFixHideKeywordsSettingsKey] !== undefined)
			{
				hideKeywords = changes[FbFixHideKeywordsSettingsKey].newValue;
				
				console.log("hideKeywords=" + hideKeywords + ", refreshing...");
				
				globalContainer.querySelectorAll('.fbFix-muted-keyword')
					.forEach( e => e.classList[hideKeywords ? 'add' : 'remove']('fbFix-muted') );
				
				refresh = true;
			}
			
			if(changes[FbFixHideAdsSettingsKey] !== undefined)
			{
				hideAds = changes[FbFixHideAdsSettingsKey].newValue;
				
				console.log("hideAds=" + hideAds + ", refreshing...");
				
				document.querySelectorAll('.fbFix-muted-ad')
					.forEach( e => e.classList[hideAds ? 'add' : 'remove']('fbFix-muted') );
				
				totalAds = 0;
				refresh = true;
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
