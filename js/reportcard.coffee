# github.com/paulirish/jquery-ajax-localstorage-cache
# dependent on Modernizr's localStorage test
$.ajaxPrefilter (options, originalOptions, jqXHR) ->
  # Cache it ?
  # Modernizr.localstorage, version 3 12/12/13

  hasLocalStorage = ->
    mod = 'modernizr'
    try
      localStorage.setItem mod, mod
      localStorage.removeItem mod
      return true
    catch e
      return false
    return

  if !hasLocalStorage() or !options.localCache
    return
  hourstl = options.cacheTTL or 5
  cacheKey = options.cacheKey or options.url.replace(/jQuery.*/, '') + options.type + (options.data or '')
  # isCacheValid is a function to validate cache
  if options.isCacheValid and !options.isCacheValid()
    localStorage.removeItem cacheKey
  # if there's a TTL that's expired, flush this item
  ttl = localStorage.getItem(cacheKey + 'cachettl')
  if ttl and ttl < +new Date
    localStorage.removeItem cacheKey
    localStorage.removeItem cacheKey + 'cachettl'
    ttl = 'expired'
  value = localStorage.getItem(cacheKey)
  if value
    #In the cache? So get it, apply success callback & abort the XHR request
    # parse back to JSON if we can.
    if options.dataType.indexOf('json') == 0
      value = JSON.parse(value)
    options.success value
    # Abort is broken on JQ 1.5 :(
    jqXHR.abort()
  else
    #If it not in the cache, we change the success callback, just put data on localstorage and after that apply the initial callback
    if options.success
      options.realsuccess = options.success

    options.success = (data) ->
      strdata = data
      if @dataType.indexOf('json') == 0
        strdata = JSON.stringify(data)
      # Save the data to localStorage catching exceptions (possibly QUOTA_EXCEEDED_ERR)
      try
        localStorage.setItem cacheKey, strdata
      catch e
        # Remove any incomplete data that may have been saved before the exception was caught
        localStorage.removeItem cacheKey
        localStorage.removeItem cacheKey + 'cachettl'
        if options.cacheError
          options.cacheError e, cacheKey, strdata
      if options.realsuccess
        options.realsuccess data
      return

    # store timestamp
    if !ttl or ttl == 'expired'
      localStorage.setItem cacheKey + 'cachettl', +new Date + 1000 * 60 * 60 * hourstl
  return


### Reportcard.js ###
# github.com/rileyhilliard/reportcard
(($) ->
  $.fn.reportCard = (options) ->
    toThousands = (x)->
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    class ReportCard
      constructor: (params) ->
        {@userName, @site, @badgesAmount, @tooltips} = params

      #Build HTML object
      build: (data)->

        lastBadges = data.badges[-(options.badgesAmount)..]
        liWidth = (100 / (lastBadges.length + 1)) + "%"

        # HTML Generator
        html = """
          <h2>I have passed #{data.badge_count} lessons and scored #{toThousands(data.points_total)} points at #{data.site}!</h2>
          <p>Check out some of my last passed course content at the badges below: </p>
          <ul class="badges">
        """
        # Badge Generator
        lastBadges.forEach (badge)->
          html += """
            <li style="width: #{liWidth};" title="#{badge.label}">
              <a href="#{data.profile_url}" target="_blank" data-toggle="tooltip" data-placement="top" >
                <img src="#{badge.icon_url}" alt="#{badge.label}"/>
              </a>
            </li>
          """

        html += "</ul>"

        # print generated HTML to page
        options.$element.html(html)

        # If Tooltips, call bootstrap tooltip plugin
        if options.tooltips
          options.$element.each (i, el)->
            $(el).find('li').tooltip()
        return

      # Default data transform
      transform: (data)->
        return data

      # Data AJAX caller
      getData: (opts)->
        $this = this
        $.ajax
          type: "GET"
          url: @url
          localCache: true
          cacheTTL: 0.5
          cacheKey: 'reportcard'+options.site+options.userName
          dataType: opts.dataType
          crossDomain: true
          async: true
          beforeSend: ->
            # Add loading Gif
            options.$element.html('<div class="spinner"></div>')
            return
          success: (data) ->
            # transform data, then build widget
            return $this.build($this.transform(data))

    # Treehosue class
    class Treehouse extends ReportCard
      constructor: (params)->
        super(params)
        @url = "https://teamtreehouse.com/" + @userName + ".json"

      getData: ->
        super({dataType:'json'})

      transform: (data)->
        return {
          site: "Treehouse"
          username: data.profile_name
          profile_url: data.profile_url
          points: data.points
          points_total: data.points.total
          badge_count: data.badges.length
          badges: data.badges.map (badge)->
            return {
              courses: badge.courses
              course_count: badge.courses.length
              earned_date: Date.parse(badge.earned_date)
              icon_url: badge.icon_url
              label: badge.name
              url: badge.url
            }
        }

    # CodeSchool Class
    class Codeschool extends ReportCard
      constructor: (params)->
        super(params)
        @url = "https://www.codeschool.com/users/" + @userName + ".json";

      getData: ->
        super({dataType:'jsonp'})

      transform: (data)->
        return {
          site: "Code School"
          username: data.user.username
          profile_url: 'https://www.codeschool.com/users/' + data.user.username
          points: undefined
          points_total: data.user.total_score
          badge_count: data.badges.length
          badges: data.badges.map (badge)->
            return {
              courses: undefined
              course_count: undefined
              earned_date: undefined
              icon_url: badge.badge
              label: badge.name
              url: badge.course_url
            }
        }

    # Init
    options.$element = this
    options.badgesAmount = if options.badgesAmount then options.badgesAmount else 5
    if !options.userName then alert('You need to pass in a username')
    if !options.site then alert('You need to pass in a site')

    if options.site == "treehouse"
      th = new Treehouse options
      th.getData()
    else if options.site == "codeschool"
      cs = new Codeschool options
      cs.getData()

) jQuery
