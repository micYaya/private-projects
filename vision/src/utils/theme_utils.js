const theme = {
    chalk: {
        backgroundColor: '#161522',
        titleColor: '#fff',
        headerBorderSrc: 'header_border_dark.png',
        themeSrc: 'theme_dark.png',
        legendColor: '#fff'
    },
    vintage: {
        backgroundColor: '#eeeeee',
        titleColor: '#000',
        headerBorderSrc: 'header_border_light.png',
        themeSrc: 'theme_light.png',
        legendColor: '000'
    }
}

export function getThemeValue(arg){
    return theme[arg]
}