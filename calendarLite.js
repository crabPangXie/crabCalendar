//注：该模块中所有月份和农历月份都从一开始
//处于性能考虑，模块以1970年2月5日（春节）做基准点，至2070年12月31日

const lunarYearArr = [
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
    0x052d0//2070
];
const BENCHMARK_YEAR = 1970;
const BENCHMARK_TIME = Date.UTC(BENCHMARK_YEAR, 1, 5);

const tianGan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const diZhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const lunarMonth = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
const lunarDay = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "初", "廿"];
const zodiac = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

// 是否闰月
function hasLeapMonth(ly) {
    //农历低四位不等于0即为存在闰月
    //存在闰月即返回闰月所在月份
    if (ly & 0x0000f) {
        return ly & 0x0000f
    } else {
        return false
    }
};
// 闰月天数
function leapMonthDays(ly) {
    //农历高四位等于0即为闰小月29天, 不等于0(等于1)即为闰大月30天
    //存在闰月即返回闰月天数
    if (hasLeapMonth(ly)) {
        return (ly & 0xf0000) ? 30 : 29
    }
    else {
        return 0
    }
};
// 一年天数
function lunarYearDays(ly) {
    //从高位第16位(1月)起向右移至低位第5位(12月)累加天数
    let totalDays = 0;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        let monthDays = (ly & i) ? 30 : 29;
        totalDays += monthDays;
    }
    //考虑是否有闰月天数
    if (hasLeapMonth(ly)) {
        totalDays += leapMonthDays(ly);
    }
    return totalDays
};
// 一年每月天数
function lunarYearMonths(ly) {
    //从高位第16位(1月)起向右移至低位第5位(12月)添加数组每项
    let monthArr = [];
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        monthArr.push((ly & i) ? 30 : 29);
    }
    //考虑是否有闰月天数
    if (hasLeapMonth(ly)) {
        monthArr.splice(hasLeapMonth(ly), 0, leapMonthDays(ly));
    }
    return monthArr
};

function getYearGan(ly) {
    let tianGanKey = (ly - 3) % 10;
    if (tianGanKey === 0) tianGanKey = 10;
    return tianGan[tianGanKey - 1]
};
function getYearZhi(ly) {
    let diZhiKey = (ly - 3) % 12;
    if (diZhiKey === 0) diZhiKey = 12;
    return diZhi[diZhiKey - 1]
};

function getDayGanZhi(sy,sm,sd){
    const time= Math.floor((Date.UTC(Number(sy), Number(sm), Number(sd))-Date.UTC(1969,11,15))/86400000);
    return tianGan[time%10]+diZhi[time%12]+'日';
};

function getMonthGanZhi(sy,sm,sd){
    //根据年干获取当前公历年立春的天干，接着获取接下来月份的天干
    let firstGanKey=10;
    //当前公历年中的农历年干支决定着当前公历年立春的天干(不管该立春是否在该农历年中)关系如下:
    if(getYearGan(sy)=='甲'||getYearGan(sy)=='己')firstGanKey+=2;
    else if(getYearGan(sy)=='乙'||getYearGan(sy)=='庚')firstGanKey+=4;
    else if(getYearGan(sy)=='丙'||getYearGan(sy)=='辛')firstGanKey+=6;
    else if(getYearGan(sy)=='丁'||getYearGan(sy)=='壬')firstGanKey+=8;
    else if(getYearGan(sy)=='戊'||getYearGan(sy)=='癸')firstGanKey+=0;
    //获取该公历年的节气列表
    let arr=new Array();
    getSolarTermsDay(sy).forEach((element)=>arr.push(element.month*100+element.date));
    //根据节气获取月支
    const date=Number(sm)*100+Number(sd);
    if(date>=arr[0]&&date<arr[2]){
        return tianGan[(firstGanKey-1)%10]+diZhi[1];
    }else if(date>=arr[2]&&date<arr[4]){
        return tianGan[firstGanKey%10]+diZhi[2];
    }else if(date>=arr[4]&&date<arr[6]){
        return tianGan[(firstGanKey+1)%10]+diZhi[3];
    }else if(date>=arr[6]&&date<arr[8]){
        return tianGan[(firstGanKey+2)%10]+diZhi[4];
    }else if(date>=arr[8]&&date<arr[10]){
        return tianGan[(firstGanKey+3)%10]+diZhi[5];
    }else if(date>=arr[10]&&date<arr[12]){
        return tianGan[(firstGanKey+4)%10]+diZhi[6];
    }else if(date>=arr[12]&&date<arr[14]){
        return tianGan[(firstGanKey+5)%10]+diZhi[7];
    }else if(date>=arr[14]&&date<arr[16]){
        return tianGan[(firstGanKey+6)%10]+diZhi[8];
    }else if(date>=arr[16]&&date<arr[18]){
        return tianGan[(firstGanKey+7)%10]+diZhi[9];
    }else if(date>=arr[18]&&date<arr[20]){
        return tianGan[(firstGanKey+8)%10]+diZhi[10];
    }else if(date>=arr[20]&&date<arr[22]){
        return tianGan[(firstGanKey+9)%10]+diZhi[11];
    }else if(date>=arr[22]||date<arr[0]){
        return tianGan[firstGanKey%10]+diZhi[0];
    }
};

//功能1：传入公历日期，返回农历日期
function solarToLunar(sy, sm, sd) {
    sy=Number(sy);
    sm=Number(sm);
    sd=Number(sd);
    let ly, lm, ld;
    if(sy<=BENCHMARK_YEAR&&sy>2070)return;
    // 计算与基准相差天数
    let differenceDay = (Date.UTC(sy, sm, sd) - BENCHMARK_TIME) / 86400000; //24*60*60*1000;

    //计算农历年份
    for (let y = 0; y < lunarYearArr.length; y++) {
        differenceDay -= lunarYearDays(lunarYearArr[y]);
        if (differenceDay <= 0) {
            ly = BENCHMARK_YEAR + y;
            // 计算返回农历年份确定后的剩余天数(用于计算农历月)
            differenceDay += lunarYearDays(lunarYearArr[y]);
            break;
        }
    };
    //计算农历月份
    for (let m = 0; m < lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR]).length; m++) {
        differenceDay -= lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR])[m];
        if (differenceDay <= 0) {
            // 有闰月时, 月份的数组长度会变成13, 因此, 当闰月月份小于等于m时, lm不需要加1
            if (hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR]) && hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR]) <= m) {
                if (hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR]) < m) {
                    lm = m-1;
                } else if (hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR]) == m) {
                    lm = m+99;//闰月特殊标记
                }
            } else {
                lm = m;
            };
            // 获取农历月份确定后的剩余天数(用于计算农历日)
            differenceDay += lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR])[m];
            break;
        }
    };

    //计算农历日
    ld = differenceDay;

    // 将计算出来的农历月份转换成汉字月份, 闰月需要在前面加上闰字
    let lm_cn=lm>=100?'闰'+lunarMonth[lm-100]+'月':lunarMonth[lm]+'月';
    //将计算出来的农历日期转换成汉字日期
    let ld_cn='';
    if (ld < 11) {
        ld_cn = `${lunarDay[10]}${lunarDay[ld - 1]}`;
    }
    else if (ld > 10 && ld < 20) {
        ld_cn = `${lunarDay[9]}${lunarDay[ld - 11]}`;
    }
    else if (ld === 20) {
        ld_cn = `${lunarDay[1]}${lunarDay[9]}`;
    }
    else if (ld > 20 && ld < 30) {
        ld_cn= `${lunarDay[11]}${lunarDay[ld - 21]}`;
    }
    else if (ld === 30) {
        ld_cn = `${lunarDay[2]}${lunarDay[9]}`;
    };
    // 计算生肖
    let zodiacStr = zodiac[(ly - BENCHMARK_YEAR + 10) % 12];
    // 将计算出来的农历年份转换为天干地支年
    let ly_ganZhi = getYearGan(ly)+getYearZhi(ly);
    // 将计算出来的农历月份份转换为天干地支月，传入年份为数字
    let  lm_ganZhi=getMonthGanZhi(sy,sm,sd)+'月';
    // 将计算出来的农历日期转换为天干地支
    let ld_ganZhi=getDayGanZhi(sy,sm,sd);

    // 后面更多返回可调用计算方法输出, 注意调用的时间农历年月日使用格式化中文前的数据
    return {
        nYear:ly,//农历年(数字)
        nMonth: lm, //农历月(数字)，从0开始，为防止出现闰月无法正常标记的问题，所以在最后-1
        nDate: ld, //农历日(数字)
        month:lm_cn,//农历月
        date:ld_cn,//农历日
        year_GanZhi:ly_ganZhi,//干支年
        month_GanZhi:lm_ganZhi,//干支月
        date_GanZhi:ld_ganZhi,//干支日
        zodiac: zodiacStr,//生肖
    }
};

//功能2：传入农历年月日，转换为公历
function lunarToSolar(ly,lm,ld){
    ly=Number(ly);
    ld=Number(ld);
    lm=Number(lm);
  //按照公历转农历的思路，同样的，我们可以根据农历日期计算与基准日所差毫秒数,并转化为公历
    if(ly<=BENCHMARK_YEAR&&ly>2070)return;
    let differenceDay=0;
    //计算年份对应天数
    for(let i=ly-BENCHMARK_YEAR;i>0;i--){
        differenceDay+=lunarYearDays(lunarYearArr[i-1])
    };
    //计算月份对应天数
    if(lm>hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR])&&hasLeapMonth(lunarYearArr[ly - BENCHMARK_YEAR])){
        for (let i = 0; i <lm+1; i++) {
            differenceDay+=lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR])[i]
        }
    }else if(lm>=100){//闰月特别判断
        for (let i = 0; i <lm-99; i++) {
            differenceDay+=lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR])[i]
        }
    } else {
        for (let i = 0; i <lm; i++) {
            differenceDay+=lunarYearMonths(lunarYearArr[ly - BENCHMARK_YEAR])[i]
        }
    };
    //最后加上天数,并转化为毫秒,再加上基准日离1970的毫秒数,获取对应天数
    differenceDay=(differenceDay+ld)*86400000+3024000000;
    return new Date(differenceDay);
};

//功能3：传入公历年份，返回该公历年份的所有节气对应的日期
function getSolarTermsDay(sy){
    sy=Number(sy);
    let solarTermsDay=new Array();
    let arryC=[];
    let y=0;
    //根据世纪确定经验数
    if(sy<2000){
        arryC=[6.11,20.84,4.6295,19.4599,6.3826,21.4155,5.59,20.888,6.318,21.86,6.5,22.2,7.928,23.65,28.35,23.95,8.44,23.822,9.098,24.218,8.218,23.08,7.9,22.6];
        y=sy-1900;
    }else if(sy==2000){
        arryC=[6.11,20.84,4.6295,19.4599,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.428,22.36,7.18,21.94];
        y=sy-2000;
    }else if(sy>2000){
        arryC=[5.4055,20.12,3.87,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.428,22.36,7.18,21.94];
        y=sy-2000;
    };
    //计算各节气日期，小寒、大寒、立春、雨水的闰年需-1再除
    for (let i = 0; i < 24; i++) {
        solarTermsDay.push({month:Math.floor(i/2),date:Math.floor(y*0.2422+arryC[i])-Math.floor((i<4?y-1:y)/4)});
    };
    //特殊情况额外判断
    switch (sy){
        case 2026:solarTermsDay[3].date-=1;break;
        case 2008:solarTermsDay[9].date+=1;break;
        case 2016:solarTermsDay[12].date+=1;break;
        case 2002:solarTermsDay[14].date+=1;break;
        case 1978:solarTermsDay[21].date+=1;break;
        case 2021:solarTermsDay[23].date-=1;break;
        case 1982:solarTermsDay[0].date+=1;break;
        case 2019:solarTermsDay[0].date-=1;break;
    };
    return solarTermsDay;
};

//功能4：传入年份，返回该年特殊节日日期
function switchFestivalDate(sy){
    sy=Number(sy);
    const juneFirstDay=new Date(sy,5).getDay();
    const mayFirstDay=new Date(sy,4).getDay();
    const NovFirstDay=new Date(sy,10).getDay();
    const chuXi=new Date(lunarToSolar(sy,1,1).getTime()-86400000);
    return [
        {festival:'除夕',month:chuXi.getMonth(),date:chuXi.getDate()},
        {festival:'母亲节',month:4,date:mayFirstDay==0?8:15-mayFirstDay},
        {festival:'父亲节',month:5,date:juneFirstDay==0?15:22-juneFirstDay},
        {festival:'感恩节',month:10,date:NovFirstDay<=4?26-NovFirstDay:33-NovFirstDay},
    ]
};

//功能5：返回当天的节日
function getFestival(lm,ld,sy,sm,sd){
    lm=Number(lm);
    ld=Number(ld);
    sy=Number(sy);
    sm=Number(sm);
    sd=Number(sd);
    let festival='';
    const lunarFestivalArr = new Array(
        {festival:'春节', month:0, date:1},           // 正月初一，公历大约在1-2月
        {festival:'人胜节', month:0, date:7},        // 正月初七
        {festival:'元宵节', month:0, date:15},       // 正月十五
        {festival:'龙抬头', month:1, date:2},        // 二月初二，公历大约在2-3月
        {festival:'端午节', month:4, date:5},        // 五月初五，公历大约在5-6月
        {festival:'七夕节', month:6, date:7},        // 七月初七，公历大约在7-8月
        {festival:'中元节', month:6, date:15},       // 七月十五
        {festival:'中秋节', month:7, date:15},       // 八月十五，公历大约在8-9月
        {festival:'重阳节', month:8, date:9},        // 九月初九，公历大约在9-10月
        {festival:'寒衣节', month:9, date:1},        // 十月初一，公历大约在10-11月
        {festival:'腊八节', month:11, date:8},       // 腊月初八，公历大约在12-1月
        {festival:'北方小年', month:11, date:23},    // 北方腊月廿三
        {festival:'南方小年', month:11, date:24}     // 南方腊月廿四
    );
    const solarFestivalArr = new Array(
        {festival:'元旦', month:0, date:1},
        {festival:'中国人民警察日', month:0, date:10},
        {festival:'情人节', month:1, date:14},
        {festival:'妇女节', month:2, date:8},
        {festival:'植树节', month:2, date:12},
        {festival:'消费者权益日', month:2, date:15},
        {festival:'世界气象日', month:2, date:23},
        {festival:'愚人节', month:3, date:1},
        {festival:'劳动节', month:4, date:1},
        {festival:'青年节', month:4, date:4},
        {festival:'护士节', month:4, date:12},
        {festival:'儿童节', month:5, date:1},
        {festival:'国际禁毒日', month:5, date:26},
        {festival:'建党节', month:6, date:1},
        {festival:'香港回归日', month:6, date:1},      // 与建党节同一天
        {festival:'七七事变纪念日', month:6, date:7},
        {festival:'建军节', month:7, date:1},
        {festival:'日本投降纪念日', month:7, date:15},
        {festival:'中国医师节', month:7, date:19},
        {festival:'抗日战争胜利纪念日', month:8, date:3},
        {festival:'教师节', month:8, date:10},
        {festival:'九一八事变纪念日', month:8, date:18},
        {festival:'中国烈士纪念日', month:8, date:30},
        {festival:'国庆节', month:9, date:1},
        {festival:'台湾光复纪念日', month:9, date:25},
        {festival:'抗美援朝纪念日', month:9, date:25}, // 与台湾光复纪念日同一天
        {festival:'世界城市日', month:9, date:31},
        {festival:'万圣节', month:9, date:31},         // 与世界城市日同一天
        {festival:'中国记者日', month:10, date:8},
        {festival:'消防宣传日', month:10, date:9},
        {festival:'世界艾滋病日', month:10, date:1},
        {festival:'国际残疾人日', month:10, date:3},
        {festival:'国际志愿人员日', month:10, date:5},
        {festival:'国家公祭日', month:11, date:13},
        {festival:'澳门回归日', month:11, date:20},
        {festival:'平安夜', month:11, date:24},
        {festival:'圣诞节', month:11, date:25}
    );
    //农历节日
    lunarFestivalArr.forEach((item)=>{
        if (lm==item.month&&ld==item.date) {
            festival+= ' '+item.festival
        }
    });
    //公历节日
    solarFestivalArr.forEach((item)=>{
        if (sm==item.month&&sd==item.date) {
            festival+= ' '+item.festival
        }
    });
    //特殊节日特殊处理
    switchFestivalDate(sy).forEach((item)=>{
        if (sm==item.month&&sd==item.date) {
            festival+= ' '+item.festival
        }
    });
    //判断节气
    const solarTermsArr=getSolarTermsDay(sy);
    const solarTermsName=['小寒','大寒','立春','雨水','惊蛰','春分','清明 清明节','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
    solarTermsArr.forEach((item,index)=>{
        if (sm==item.month&&sd==item.date) {
            festival+= ''+solarTermsName[index];
        }
    });
    return festival.slice(1);
};
//转化节日(螃蟹肯定以为自己这个算法老高级了)
function getSeason(sm){
    return ['春','夏','秋','冬'][Math.floor((Number(sm)+9)/3)%4]
};
//转换星座
function getStarSigns(sm,sd){
    const date=(Number(sm)+1)*100+Number(sd);
    if(date<120){
        return '摩羯座';
    }else if(date>=120&&date<219){
        return '水瓶座';
    }else if(date>=219&&date<321){
        return '双鱼座';
    }else if(date>=321&&date<420){
        return '白羊座';
    }else if(date>=420&&date<521){
        return '金牛座';
    }else if(date>=521&&date<622){
        return '双子座';
    }else if(date>=622&&date<723){
        return '巨蟹座';
    }else if(date>=723&&date<823){
        return '狮子座';
    }else if(date>=823&&date<923){
        return '处女座';
    }else if(date>=923&&date<1024){
        return '天秤座';
    }else if(date>=1024&&date<1123){
        return '天蝎座';
    }else if(date>=1123&&date<1222){
        return '射手座';
    }else {return '摩羯座'};
};
export {solarToLunar,lunarToSolar,getSolarTermsDay,switchFestivalDate,getFestival,getSeason,getStarSigns}

