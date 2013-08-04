// Configuration
var treehouseUserName = "rileyhilliard";
var treehouseJsonUrl = "http://teamtreehouse.com/"+treehouseUserName+".json";

// Functions //

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function generateTreehousePoints(points) {
    var pointsContainer = [];
    var value = 0;

    /* If the JSON points total is ever needed... */
    // var pointsCountTotal = points.total;

    $.each(points, function (key, val) {
        if (val.key !== 'total') {
            value = value + val.value;
        }
    });
    //Loop to add each point total.
    pointsContainer += '<div id="mainPoints"  class="badgesChart treehouseBadgesChart"><li><div class="progress">';
    $.each(points, function (i, val2) {
        if (val2.key === 'total') {
            // Do Nothing
        } else {
            var percent = ((val2.value / value) * 100);

            if (percent < 12) {
                pointsContainer += '<div data-toggle="tooltip" title="I\'ve scored ' + numberWithCommas(val2.value) + ' points in ' + val2.key + ' at TreeHouse!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"></div>';
            } else {
                pointsContainer += '<div data-toggle="tooltip" title="I\'ve scored ' + numberWithCommas(val2.value) + ' points in ' + val2.key + ' at TreeHouse!" class="' + val2.key + ' bar" style="width: ' + percent + '%;"><span>' + val2.key + '</span></div>';
            }
        }
    });
    pointsContainer += '</div></li></div>';
    $('.treehouse-badges').append(pointsContainer);
}

function badgeBuilder(treeBadges) {
    var badgesArray = [];
    var badgesCount = treeBadges.length;
    var count = 6;
    var summary = "<p>Some of the last few courses I've taken were on ";

    badgesArray += '<ul class="badges">';
    for (var e = 0; e < count; e++) {
        var date = new Date(treeBadges[e].earned_date);
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var earnedDate = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

        if (e < count - 1) {
            badgesArray += '<li style="width: ' + Math.floor((91.5 / count) * 100) / 100 + '%"><a href="' + treeBadges[e].url + '" title="I earned the ' + treeBadges[e].name + ' badge on ' + earnedDate + '" target="_blank"><img class="treebadge" src="http:' + treeBadges[e].icon_url + '" alt="' + treeBadges[e].name + '" title="I earned the \'' + treeBadges[e].name + '\' badge on ' + earnedDate + '"/></a></li>';
        } else {
            badgesArray += '<li style="width: ' + Math.floor((91.5 / count) * 100) / 100 + '%" class="more-on-treehouse"><a href="http://teamtreehouse.com/'+treehouseUserName+'" target="_blank" title="Check out the other ' + (badgesCount - count + 1) + ' badges at Treehouse!" >+' + (badgesCount - count + 1) + '</a></li>';
        }

        if (e < 3) {
            summary += '<strong>' + treeBadges[e].name + '</strong>' + ", ";
        } else if (e < 4) {
            summary += " and <strong>" + treeBadges[e].name + "</strong>!</p>";
        }
    }
    badgesArray += "</ul>";

    return badgesArray + summary;
}

function generateTreehouseBadges(badges) {
    // Latest Badges Builder
    var badgesArray = badgeBuilder(badges);

    // Badges this month
    var badgesThisMonth = 0,
        badgesThreeMonth = 0;
    $.each(badges, function (i) {
        var badgeDate = Date.parse(badges[i].earned_date),
            now = Date.parse(new Date());
        if (badgeDate > now - 2628000000 /* <-- One Month in Milliseconds */ ) {
            badgesThisMonth = badgesThisMonth + 1;

        } else if (badgeDate > now - 7889237667) {
            badgesThreeMonth = badgesThreeMonth + 1;
        }
    });
    // Append Badge to badges
    $('.treehouse-badges').append(badgesArray);
}

function calcHeight(){
    var $more = $('.more-on-treehouse a');
    $.each($more, function(){
        var height = $(this).parent().parent().find('li:first-child img').height();
        console.log('calc\'d height is:'+height);
        console.log($(this).parent().parent().find('li:first-child img'));
        $(this).height(height).css('line-height',height+"px");
    }); 
}

function firstImageLoad(){
    var $images = $(".badges img"), 
        imageCount = $images.length, 
        counter = 0;

    // one instead of on, because it need only fire once per image
    $images.one("load",function(){
        console.log(counter);
         // increment counter everytime an image finishes loading
         counter++;
         if (counter == imageCount) {
            // do stuff when all have loaded
            calcHeight();
         } 
    }).each(function () {
        if (this.complete) {
            // manually trigger load event in
            // event of a cache pull
            $(this).trigger("load");
            calcHeight();
        }
    });
}

function reloadTips() {
    $('.progress div').tooltip();
    $('.badges img').tooltip();
    $('.more-on-treehouse a').tooltip();
    $('.stats-table td').children().tooltip();
    calcHeight();
}

function reverseSortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function (a, b) {
        return b.value - a.value;
    });
    return arr; // returns array
}

// TreeHouse Badges
$.ajax({
    type: "GET",
    url: treehouseJsonUrl,
    datatype: "json",
    async: true,
    cache: false,
    // Before ajax is called
    beforeSend: function () {
        var gif = '<div class="loadinggif"><p style="text-align:center;">Loading Report Card...</p><div style="margin:0 auto; width:30px;"><img src="img/ajax-loader.gif" /><div></div>';
        $('.treehouse-badges').parent().prepend(gif);
        $(".treehouse-badges").hide();
    },
    // If ajax succeeds
    success: function (data) {
        var latest = reverseSortObject(data.points);
        $(".treehouse-badges").append('<h1>I have passed ' + data.badges.length + ' lessons and scored ' + numberWithCommas(data.points.total) + ' points at Treehouse!</h1><p>Check out some of my last passed course content at the badges below: </p>');
        generateTreehouseBadges(data.badges.reverse());
        generateTreehousePoints(latest);
    },
    // If ajax fails
    error: function () {},
    // When succeed or fail procees completes 
    complete: function () {
        $('.loadinggif').remove();
        $(".treehouse-badges").fadeIn(1000).slideDown();
        reloadTips();
        firstImageLoad();
    }
});

// re-calc 'more' badge height on resize
$(window).resize(function() {
    calcHeight();
});
