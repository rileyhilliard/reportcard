calcHeight = ->
  $more = $(".more-badges a")
  $.each $more, ->
    height = $(this).parent().parent().find("li:first-child img").height()
    $(this).height(height).css "line-height", height + "px"
    return
  return
(($) ->
  $.fn.reportCard = (options) ->
    numberWithCommas = (x) ->
      x.toString().replace /\B(?=(\d{3})+(?!\d))/g, ","
    calcDate = (date) ->
      monthNames = [
        "January"
        "February"
        "March"
        "April"
        "May"
        "June"
        "July"
        "August"
        "September"
        "October"
        "November"
        "December"
      ]
      monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
    firstImageLoad = ->
      $images = $(".badges img")
      imageCount = $images.length
      counter = 0

      # one instead of on, because it need only fire once per image
      # increment counter everytime an image finishes loading
      # do stuff when all have loaded
      $images.one("load", ->
        counter++
        calcHeight()  if counter is imageCount
        return
      ).each ->
        if @complete
          # manually trigger load event in
          # event of a cache pull
          $(this).trigger "load"
          calcHeight()
        return

      return
    reloadTips = ->
      $(".progress div, .badges img, .more-badges a").tooltip()
      return
    calculateTreehouseDemensions = ->
      $.each $(".report-card.treehouse"), ->
        widgetWidth = $(this).width()
        if widgetWidth > 899
          $(this).find(".more-badges").css "font-size", "45px"
          $(this).find("h1").css
            "font-size": "3em"
            "line-height": "1.2em"

        else if widgetWidth > 579
          $(this).find(".more-badges").css "font-size", "30px"
          $(this).find("h1").css
            "font-size": "2em"
            "line-height": "1.2em"

        else if widgetWidth < 500
          $(this).find(".more-badges").css "font-size", "20px"
          $(this).find("h1").css
            "font-size": "20px"
            "line-height": "25px"

        else if widgetWidth < 261
          $(this).find(".more-badges").css
            width: "9%"
            "font-size": "15px"

        if widgetWidth > 300
          $(this).find(".more-badges").show()
        else
          $(this).find(".more-badges").hide()
        return

      return
    treehouseReportCard = (options) ->
      badgeBuilder = (badges) ->
        badgesArray = []
        badgesCount = badges.length
        count = settings.badgesAmount
        summary = "<p>Some of the last few courses I've taken were on "
        badgesArray += "<ul class=\"badges\">"
        e = 0

        while e < count and e < badgesCount
          date = new Date(badges[e].earned_date)
          earnedDate = calcDate(date)
          if e < count - 1
            badgesArray += "<li style=\"width: " + (((90 / count) * 100) / 100).toFixed(2) + "%\"><a href=\"" + badges[e].url + "\" title=\"I earned the " + badges[e].name + " badge on " + earnedDate + "\" target=\"_blank\"><img class=\"treebadge\" src=\"" + badges[e].icon_url + "\" alt=\"" + badges[e].name + "\" title=\"I earned the '" + badges[e].name + "' badge on " + earnedDate + "\"/></a></li>"
          else
            badgesArray += "<li style=\"width: " + (((90 / count) * 100) / 100).toFixed(2) + "%\" class=\"more-badges\"><a href=\"http://teamtreehouse.com/" + userName + "\" target=\"_blank\" title=\"Check out the other " + (badgesCount - count + 1) + " badges at Treehouse!\" >+" + (badgesCount - count + 1) + "</a></li>"
          if e < 3
            summary += "<strong>" + badges[e].name + "</strong>" + ", "
          else summary += " and <strong>" + badges[e].name + "</strong>!</p>"  if e < 4
          e++
        badgesArray += "</ul>"
        badgesArray + summary
      generateBadges = (badges) ->

        # Latest Badges Builder
        badgesArray = badgeBuilder(badges)

        # Badges this month
        # Not currently being used, but this could be for a "badeges this month" or "Badges this year"
        badgesThisMonth = 0
        badgesThisYear = 0
        $.each badges, (i) ->
          badgeDate = Date.parse(badges[i].earned_date)
          now = Date.parse(new Date())
          # <-- One Month in Milliseconds
          badgesThisMonth = badgesThisMonth + 1  if badgeDate > now - 2628000000
          badgesThisMonth = badgesThisYear + 1  if badgeDate > now - 3.15569e10
          return

        # Append Badge to badges
        $(".report-card.treehouse").append badgesArray
        return
      userName = options.userName
      reportCardUrl = "http://teamtreehouse.com/" + options.userName + ".json"
      $.ajax
        type: "GET"
        url: reportCardUrl
        datatype: "json"
        async: true
        cache: false
        beforeSend: ->
          $(".report-card.treehouse").parent().prepend gif
          $(".report-card.treehouse").hide()
          return

        success: (data) ->
          dObj = (if (typeof data is "string") then JSON.parse(data) else data)
          $(".report-card.treehouse").append "<h1>I have passed " + dObj.badges.length + " lessons and scored " + numberWithCommas(dObj.points.total) + " points at Treehouse!</h1><p>Check out some of my last passed course content at the badges below: </p>"
          generateBadges dObj.badges.reverse()
          return
        complete: ->
          $(".report-card.treehouse").prev().remove()
          $(".report-card.treehouse").fadeIn 1000
          reloadTips() if options.tooltips
          firstImageLoad()
          calculateTreehouseDemensions()
          return
      return

    ### CodeSchool Code ###
    codeschoolReportCard = (options) ->
      badgeGenerator = (badges) ->
        completed = ""
        dividePercentage = ((if badges.length > 2 then 93 else 10))
        width = (dividePercentage / badges.length).toFixed(2)
        completed += "<ul class=\"badges codeschool\">"
        $.each badges, (i) ->
          title = badges[i].title
          completed += "<li style=\"width:" + width + "%;\">"
          completed += "<a href=\"" + badges[i].url + "\" title=\"" + title + "\" target=\"_blank\">"
          completed += "<img src=\"" + badges[i].badge + "\" title=\"" + title + "\" alt=\"" + title + "\" />"
          completed += "</a>"
          completed += "</li>"
          return

        completed += "</ul>"
        completed
      codeschoolBadgeCount = (type) ->
        $.each type, (i) ->
          title = type[i].title
          switch title
            when "Discover DevTools"
              dev = dev + 1
              total = total + 1
            when "jQuery Air: Captain's Log"
              javaScript = javaScript + 1
              total = total + 1
            when "Anatomy of Backbone.js"
              javaScript = javaScript + 1
              total = total + 1
            when "Git Real"
              git = git + 1
              total = total + 1
            when "Try jQuery"
              javaScript = javaScript + 1
              total = total + 1
            when "Assembling Sass"
              css = css + 1
              total = total + 1
            when "Real-time Web with Node.js"
              javaScript = javaScript + 1
              total = total + 1
            when "Rails Testing for Zombies"
              ruby = ruby + 1
              total = total + 1
            when "CSS Cross-Country"
              css = css + 1
              total = total + 1
            when "CoffeeScript"
              javaScript = javaScript + 1
              total = total + 1
            when "Rails for Zombies 2"
              ruby = ruby + 1
              total = total + 1
            when "Functional HTML5 & CSS3"
              css = css + 1
              html = html + 1
              total = total + 1
            when "jQuery Air: First Flight"
              javaScript = javaScript + 1
              total = total + 1
            when "Try Git"
              git = git + 1
              total = total + 1
            when "Rails for Zombies Redux"
              ruby = ruby + 1
              total = total + 1
            when "Try Ruby"
              ruby = ruby + 1
              total = total + 1

        return
      generateCodeSchoolBadges = (data) ->
        compleatedCourses = data.courses.completed
        enrolledCourses = data.courses.in_progress
        complete = badgeGenerator(compleatedCourses)
        enrolled = badgeGenerator(enrolledCourses)
        codeschoolBadgeCount compleatedCourses
        codeschoolBadgeCount enrolledCourses
        obj.javascript = javaScript
        obj.ruby = ruby
        obj.html = html
        obj.css = css
        obj.dev = dev
        obj.git = git
        obj.total = total

        # Fix STUPID Codeschool 'Total Score' format
        totalScore = data.user.total_score
        $(".report-card.codeschool").append "<h5>I've completed " + compleatedCourses.length + " courses, earned " + data.badges.length + " badges, and scored " + numberWithCommas(totalScore) + " points at CodeSchool!</h5>"
        $(".report-card.codeschool").append complete
        $(".report-card.codeschool").append "<hr><p>I am also currently enrolled in " + enrolledCourses.length + " additional courses, including: <p>"
        $(".report-card.codeschool").append enrolled
        $(".report-card.codeschool img, .report-card.codeschool img").tooltip() if options.tooltips
        return
      username = options.userName
      codeschoolJsonUrl = "https://www.codeschool.com/users/" + username + ".json"
      totalScore = 0
      javaScript = 0
      git = 0
      ruby = 0
      html = 0
      css = 0
      dev = 0
      total = 0
      obj = {}
      $.ajax
        type: "GET"
        url: codeschoolJsonUrl
        dataType: "jsonp"
        cache: false

        # Before ajax is called
        beforeSend: ->
          $(".report-card.codeschool").parent().prepend gif
          $(".report-card.codeschool").hide()
          return


        # If ajax succeeds
        success: (data) ->
          generateCodeSchoolBadges data
          $(".CodeSchool-chart div").tooltip() if options.tooltips
          return


        # If ajax fails
        error: ->
          console.log "error..."
          return


        # When succeed or fail procees completes
        complete: ->
          $(".report-card.codeschool").prev().remove()
          $(".report-card.codeschool").fadeIn 1000
          return

      return
    gif = "<div class=\"loadinggif\"><p style=\"text-align:center;\">Loading Report Card...</p><div class=\"spinner\"></div></div>"

    # This is the easiest way to have default options.
    settings = $.extend(

      # These are the defaults.
      userName: "rileyhilliard"
      site: "treehouse"
      badgesAmount: 6
    , options)
    if settings.site is "treehouse"
      treehouseReportCard settings
    else codeschoolReportCard settings  if settings.site is "codeschool"

    # re-calc more badge height
    $(window).resize ->
      calcHeight()
      calculateTreehouseDemensions()
      return
    return
  return
) jQuery

# re-calc more badge height
$(window).resize ->
  calcHeight()
  return
