(function () {
    console.log("eTL Highlighter enabled.")
    const current_url = window.location.href
    const domain = current_url.split('/').slice(0, 3).join('/')
    const course_view_url_start = `${domain}/course/view.php?id=`
    const check_view_state_url_start = `${domain}/report/ubcompletion/user_progress.php?id=`

    function normalize_title(title) {
        return title.replace(/ /g, '')
    }

    function get_presence(item) {
        let td = item.not('.vmiddle')
        return td.last()[0] ? td.last()[0].innerText : ''
    }
    function get_dday(date){
        let today = new Date().getTime();
        let retn={}
        let gap = date.getTime() - today
        retn['hour'] = Math.floor(gap / (1000 * 60 * 60))
        retn['min'] = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60))
        retn['sec'] = Math.floor(gap/1000)
        return retn
    }
    function highlight_video(){
        let id = +current_url.substr(course_view_url_start.length)
        if (!isFinite(id) || isNaN(id))
            throw Error('id is NaN')
        let html = $.ajax({url: check_view_state_url_start + id, async: false}).responseText
        let vdom = $.parseHTML(html)

        let video_state_list = Array.from($(vdom).find('.user_progress')[0].children[2].children).map(e => ({

            title: normalize_title($(e).find('.text-left')[0] ? $(e).find('.text-left')[0].innerText : ""),
            presence: get_presence($(e).find('.text-center'))
        })).filter(video => video.title)

        let video_state_map_by_title = {}
        for (let video_state of video_state_list)
            video_state_map_by_title[video_state.title] = video_state
        let videos = Array.from($("a[href*='http://etl.snu.ac.kr/mod/vod/view.php']")).map(e => ($(e).find('span.instancename')[0]))

        for (let video of videos) {
            let title = normalize_title(video.innerText.split('\n')[0])
            let style = video.style

            let state = video_state_map_by_title[title]
            if (state) {

                style['font-weight'] = 'bold'
                video.innerText = `[${state.presence}] ${video.innerText.split('\n')[0]}`
                if (state.presence == '100%')
                    style['color'] = 'green'
                else {
                    if (state.presence.includes('%'))
                        style['color'] = 'orange'
                    else
                        style['color'] = 'red'
                    let dday_txt = $(video.parentElement.parentElement).find('.text-ubstrap')[0]
                    if (dday_txt) {
                        let date = new Date(dday_txt.innerText.split("~")[1].trim())

                        if (!isNaN(date.getTime())) {
                            let dday = get_dday(date)
                            let hour = dday['hour']
                            if (hour >= 0) {
                                let txt = ": "
                                if (hour <= 48) {
                                    txt += hour + "시간 "
                                    if (hour <= 24) {
                                        let min = dday['min']
                                        txt += min + "분 "
                                    }
                                    video.innerText += txt + "남음"
                                }
                            } else {
                                video.innerText += ": 마감"
                            }
                        }
                    }


                }

                if (video.className.includes('dimmed')) {
                    video.className = ''
                    video.children[0].style['opacity'] = '0.5'
                }
            } else {
                style['color'] = 'blue'
                video.innerText = `${video.innerText.split('\n')[0]}(출석부에 없음)`
            }
        }
    }
    function highlight_assignment(){
        let assignments = Array.from($("a[href*='http://etl.snu.ac.kr/mod/assign/view.php']"))
        for (let assign of assignments) {
            let url = assign.href
            let span = $(assign).find('.instancename')[0]
            let status_text = document.createElement("span")
            status_text.innerText = "확인중..."
            assign.appendChild(status_text)
            $.ajax({
                url: url, success: function (data) {
                    let html = data
                    let vdom = $.parseHTML(html)

                    let is_submitted = $(vdom).find(".submissionstatussubmitted").length != 0
                    if (is_submitted) {
                        let is_late = $(vdom).find(".latesubmission").length != 0
                        if (is_late) {
                            status_text.innerText = " 지각 제출 "
                            status_text.style['color'] = 'orange'
                            span.style['color'] = 'green'
                            span.style['font-weight'] = 'bold'
                        } else {
                            status_text.innerText = " 기간 내 제출 "
                            status_text.style['color'] = 'green'
                            span.style['color'] = 'green'
                            span.style['font-weight'] = 'bold'
                        }

                    } else {
                        let time_left = html.split("마감까지 남은 기한</td>")[1].split("</td>")[0].split(">")[1]
                        status_text.innerText = ` 미제출(${time_left}) `
                        status_text.style['color'] = 'red'
                        span.style['color'] = 'red'
                        span.style['font-weight'] = 'bold'
                    }
                }
            })
        }
    }
    function highlight_zoom(){
        let zooms = Array.from($("a[href*='http://etl.snu.ac.kr/mod/zoom/view.php']"))
        for(let zoom of zooms){
            let url = zoom.href
            let timespan = document.createElement('span')
            timespan.innerText = ": 확인중..."
            $(zoom).find('span.instancename')[0].appendChild(timespan)
            $.ajax(
                {

                    url:url,
                    success: function(data){
                        let html = data
                        let vdom = $.parseHTML(html)
                        let datetxt=$(vdom).find('#region-main > div > table > tbody > tr:nth-child(2) > td.cell.c1.lastcol')[0].innerText
                        console.log(datetxt)
                        let date = new Date(datetxt)
                        timespan.innerText=': '+$(vdom).find('#region-main > div > table > tbody > tr.lastrow > td.cell.c1.lastcol')[0].innerText
                        if(!isNaN(date.getTime())){
                            let dday = get_dday(date)
                            let hour = dday['hour']
                            if(hour>=0){
                                if(hour<=10) {
                                    let txt = `: ${hour}시간 `
                                    if (hour <= 2) {
                                        txt += `${min}분`
                                    }
                                    txt += ' 후 시작'

                                    timespan.innerText = txt
                                } else {
                                    timespan.innerText = ''
                                }
                            }
                        }


                    }
                }
            )
        }
    }
    if (current_url.startsWith(course_view_url_start)) {

        $(function () {
            highlight_video()
            highlight_assignment()
            highlight_zoom()
        })
    }
})()