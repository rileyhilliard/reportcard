var calcHeight;

calcHeight = function() {
  var $more;
  $more = $(".more-badges a");
  $.each($more, function() {
    var height;
    height = $(this).parent().parent().find("li:first-child img").height();
    $(this).height(height).css("line-height", height + "px");
  });
};

(function($) {
  $.fn.reportCard = function(options) {
    var calcDate, calculateTreehouseDemensions, codeschoolReportCard, firstImageLoad, gif, numberWithCommas, reloadTips, settings, treehouseReportCard;
    numberWithCommas = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    calcDate = function(date) {
      var monthNames;
      monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
    };
    firstImageLoad = function() {
      var $images, counter, imageCount;
      $images = $(".badges img");
      imageCount = $images.length;
      counter = 0;
      $images.one("load", function() {
        counter++;
        if (counter === imageCount) {
          calcHeight();
        }
      }).each(function() {
        if (this.complete) {
          $(this).trigger("load");
          calcHeight();
        }
      });
    };
    reloadTips = function() {
      $(".progress div, .badges img, .more-badges a").tooltip();
    };
    calculateTreehouseDemensions = function() {
      $.each($(".report-card.treehouse"), function() {
        var widgetWidth;
        widgetWidth = $(this).width();
        if (widgetWidth > 899) {
          $(this).find(".more-badges").css("font-size", "45px");
          $(this).find("h1").css({
            "font-size": "3em",
            "line-height": "1.2em"
          });
        } else if (widgetWidth > 579) {
          $(this).find(".more-badges").css("font-size", "30px");
          $(this).find("h1").css({
            "font-size": "2em",
            "line-height": "1.2em"
          });
        } else if (widgetWidth < 500) {
          $(this).find(".more-badges").css("font-size", "20px");
          $(this).find("h1").css({
            "font-size": "20px",
            "line-height": "25px"
          });
        } else if (widgetWidth < 261) {
          $(this).find(".more-badges").css({
            width: "9%",
            "font-size": "15px"
          });
        }
        if (widgetWidth > 300) {
          $(this).find(".more-badges").show();
        } else {
          $(this).find(".more-badges").hide();
        }
      });
    };
    treehouseReportCard = function(options) {
      var badgeBuilder, generateBadges, reportCardUrl, userName;
      badgeBuilder = function(badges) {
        var badgesArray, badgesCount, count, date, e, earnedDate, summary;
        badgesArray = [];
        badgesCount = badges.length;
        count = settings.badgesAmount;
        summary = "<p>Some of the last few courses I've taken were on ";
        badgesArray += "<ul class=\"badges\">";
        e = 0;
        while (e < count && e < badgesCount) {
          date = new Date(badges[e].earned_date);
          earnedDate = calcDate(date);
          if (e < count - 1) {
            badgesArray += "<li style=\"width: " + (((90 / count) * 100) / 100).toFixed(2) + "%\"><a href=\"" + badges[e].url + "\" title=\"I earned the " + badges[e].name + " badge on " + earnedDate + "\" target=\"_blank\"><img class=\"treebadge\" src=\"" + badges[e].icon_url + "\" alt=\"" + badges[e].name + "\" title=\"I earned the '" + badges[e].name + "' badge on " + earnedDate + "\"/></a></li>";
          } else {
            badgesArray += "<li style=\"width: " + (((90 / count) * 100) / 100).toFixed(2) + "%\" class=\"more-badges\"><a href=\"http://teamtreehouse.com/" + userName + "\" target=\"_blank\" title=\"Check out the other " + (badgesCount - count + 1) + " badges at Treehouse!\" >+" + (badgesCount - count + 1) + "</a></li>";
          }
          if (e < 3) {
            summary += "<strong>" + badges[e].name + "</strong>" + ", ";
          } else {
            if (e < 4) {
              summary += " and <strong>" + badges[e].name + "</strong>!</p>";
            }
          }
          e++;
        }
        badgesArray += "</ul>";
        return badgesArray + summary;
      };
      generateBadges = function(badges) {
        var badgesArray, badgesThisMonth, badgesThisYear;
        badgesArray = badgeBuilder(badges);
        badgesThisMonth = 0;
        badgesThisYear = 0;
        $.each(badges, function(i) {
          var badgeDate, now;
          badgeDate = Date.parse(badges[i].earned_date);
          now = Date.parse(new Date());
          if (badgeDate > now - 2628000000) {
            badgesThisMonth = badgesThisMonth + 1;
          }
          if (badgeDate > now - 3.15569e10) {
            badgesThisMonth = badgesThisYear + 1;
          }
        });
        $(".report-card.treehouse").append(badgesArray);
      };
      userName = options.userName;
      reportCardUrl = "http://teamtreehouse.com/" + options.userName + ".json";
      $.ajax({
        type: "GET",
        url: reportCardUrl,
        datatype: "json",
        async: true,
        cache: false,
        beforeSend: function() {
          $(".report-card.treehouse").parent().prepend(gif);
          $(".report-card.treehouse").hide();
        },
        success: function(data) {
          var dObj;
          dObj = (typeof data === "string" ? JSON.parse(data) : data);
          $(".report-card.treehouse").append("<h1>I have passed " + dObj.badges.length + " lessons and scored " + numberWithCommas(dObj.points.total) + " points at Treehouse!</h1><p>Check out some of my last passed course content at the badges below: </p>");
          generateBadges(dObj.badges.reverse());
        },
        complete: function() {
          $(".report-card.treehouse").prev().remove();
          $(".report-card.treehouse").fadeIn(1000);
          if (options.tooltips) {
            reloadTips();
          }
          firstImageLoad();
          calculateTreehouseDemensions();
        }
      });
    };

    /* CodeSchool Code */
    codeschoolReportCard = function(options) {
      var badgeGenerator, codeschoolBadgeCount, codeschoolJsonUrl, css, dev, generateCodeSchoolBadges, git, html, javaScript, obj, ruby, total, totalScore, username;
      badgeGenerator = function(badges) {
        var completed, dividePercentage, width;
        completed = "";
        dividePercentage = (badges.length > 2 ? 93 : 10);
        width = (dividePercentage / badges.length).toFixed(2);
        completed += "<ul class=\"badges codeschool\">";
        $.each(badges, function(i) {
          var title;
          title = badges[i].title;
          completed += "<li style=\"width:" + width + "%;\">";
          completed += "<a href=\"" + badges[i].url + "\" title=\"" + title + "\" target=\"_blank\">";
          completed += "<img src=\"" + badges[i].badge + "\" title=\"" + title + "\" alt=\"" + title + "\" />";
          completed += "</a>";
          completed += "</li>";
        });
        completed += "</ul>";
        return completed;
      };
      codeschoolBadgeCount = function(type) {
        $.each(type, function(i) {
          var css, dev, git, html, javaScript, ruby, title, total;
          title = type[i].title;
          switch (title) {
            case "Discover DevTools":
              dev = dev + 1;
              return total = total + 1;
            case "jQuery Air: Captain's Log":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Anatomy of Backbone.js":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Git Real":
              git = git + 1;
              return total = total + 1;
            case "Try jQuery":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Assembling Sass":
              css = css + 1;
              return total = total + 1;
            case "Real-time Web with Node.js":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Rails Testing for Zombies":
              ruby = ruby + 1;
              return total = total + 1;
            case "CSS Cross-Country":
              css = css + 1;
              return total = total + 1;
            case "CoffeeScript":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Rails for Zombies 2":
              ruby = ruby + 1;
              return total = total + 1;
            case "Functional HTML5 & CSS3":
              css = css + 1;
              html = html + 1;
              return total = total + 1;
            case "jQuery Air: First Flight":
              javaScript = javaScript + 1;
              return total = total + 1;
            case "Try Git":
              git = git + 1;
              return total = total + 1;
            case "Rails for Zombies Redux":
              ruby = ruby + 1;
              return total = total + 1;
            case "Try Ruby":
              ruby = ruby + 1;
              return total = total + 1;
          }
        });
      };
      generateCodeSchoolBadges = function(data) {
        var compleatedCourses, complete, enrolled, enrolledCourses, totalScore;
        compleatedCourses = data.courses.completed;
        enrolledCourses = data.courses.in_progress;
        complete = badgeGenerator(compleatedCourses);
        enrolled = badgeGenerator(enrolledCourses);
        codeschoolBadgeCount(compleatedCourses);
        codeschoolBadgeCount(enrolledCourses);
        obj.javascript = javaScript;
        obj.ruby = ruby;
        obj.html = html;
        obj.css = css;
        obj.dev = dev;
        obj.git = git;
        obj.total = total;
        totalScore = data.user.total_score;
        $(".report-card.codeschool").append("<h5>I've completed " + compleatedCourses.length + " courses, earned " + data.badges.length + " badges, and scored " + numberWithCommas(totalScore) + " points at CodeSchool!</h5>");
        $(".report-card.codeschool").append(complete);
        $(".report-card.codeschool").append("<hr><p>I am also currently enrolled in " + enrolledCourses.length + " additional courses, including: <p>");
        $(".report-card.codeschool").append(enrolled);
        if (options.tooltips) {
          $(".report-card.codeschool img, .report-card.codeschool img").tooltip();
        }
      };
      username = options.userName;
      codeschoolJsonUrl = "https://www.codeschool.com/users/" + username + ".json";
      totalScore = 0;
      javaScript = 0;
      git = 0;
      ruby = 0;
      html = 0;
      css = 0;
      dev = 0;
      total = 0;
      obj = {};
      $.ajax({
        type: "GET",
        url: codeschoolJsonUrl,
        dataType: "jsonp",
        cache: false,
        beforeSend: function() {
          $(".report-card.codeschool").parent().prepend(gif);
          $(".report-card.codeschool").hide();
        },
        success: function(data) {
          generateCodeSchoolBadges(data);
          if (options.tooltips) {
            $(".CodeSchool-chart div").tooltip();
          }
        },
        error: function() {
          console.log("error...");
        },
        complete: function() {
          $(".report-card.codeschool").prev().remove();
          $(".report-card.codeschool").fadeIn(1000);
        }
      });
    };
    gif = "<div class=\"loadinggif\"><p style=\"text-align:center;\">Loading Report Card...</p><div class=\"spinner\"></div></div>";
    settings = $.extend({
      userName: "rileyhilliard",
      site: "treehouse",
      badgesAmount: 6
    }, options);
    if (settings.site === "treehouse") {
      treehouseReportCard(settings);
    } else {
      if (settings.site === "codeschool") {
        codeschoolReportCard(settings);
      }
    }
    $(window).resize(function() {
      calcHeight();
      calculateTreehouseDemensions();
    });
  };
})(jQuery);

$(window).resize(function() {
  calcHeight();
});
