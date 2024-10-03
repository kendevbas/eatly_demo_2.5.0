// Импортируем необходимые модули
import gulp from 'gulp';
import include from 'gulp-include';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin'; 
import browserSync from 'browser-sync';
import gulpSass from 'gulp-sass';
import dartSass from 'sass'; // Импортируем сам компилятор
const sass = gulpSass(dartSass); // Устанавливаем компилятор


// Создаем экземпляр BrowserSync
const browser = browserSync.create();

// Функция для простого перемещения файлов
function moveImages() {
    return gulp.src('./src/assets/**/*', { encoding: false }) // берем все файлы и поддиректории
        .pipe(gulp.dest('./dist/assets/')); // перемещаем их в папку dist
}

// Функция для обработки HTML
function pages() {
    return gulp.src('./src/pages/*.html') // Обработка всех HTML-файлов
        .pipe(include({
            includePaths: './src/components' // Путь для подключения компонентов
        }))
        .pipe(gulp.dest('./dist')) // Сохраняем в папку dist
        .pipe(browser.stream()); // Обновляем браузер
}

// Функция для сборки SCSS
function build(done) {
    gulp.src('./src/scss/core.scss') // Путь к основному SCSS файлу
        .pipe(sourcemaps.init()) // Инициализация sourcemaps
        .pipe(sass({
            errorLogToConsole: true, // Логирование ошибок в консоль
            outputStyle: 'compressed' // Сжатый вывод
        }).on('error', sass.logError)) // Правильная обработка ошибок для sass
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'], // Поддержка старых браузеров
            cascade: false // Отключение каскадного стиля
        }))
        .pipe(sourcemaps.write('.clear/css_map')) // Указываем путь к папке с картами
        .pipe(gulp.dest('./dist')) // Сохраняем скомпилированный CSS в папку dist
        .pipe(browser.stream()); // Обновляем браузер

    done();
}

// Функция для наблюдения за изменениями файлов
function watchSass() {
    gulp.watch('./src/scss/**/*.scss', build); // Наблюдение за изменениями SCSS файлов
    gulp.watch(['src/components/*.html', 'src/pages/*.html'], pages); // Наблюдение за изменениями HTML файлов
    gulp.watch('./src/js/*.js', minifyJs); // Наблюдение за изменениями JS файлов
    
    //Второй вариант отслеживания изменений в файлах и обновление страницы, однако сколько раз прописывается "on('change', browser.reload)", столько раз страница и будет обновляться при запуске проекта и каждый раз при изменении любого файла
    
    // gulp.watch('./**/*.html').on('change', browser.reload); перезагрузка страницы при изменении любого html файлы
    // gulp.watch('./**/*.css').on('change', browser.reload); перезагрузка страницы при изменении любого css файлы
    // gulp.watch('./**/*.js').on('change', browser.reload); перезагрузка страницы при изменении любого js файлы
}


// Функция для минификации JS
function minifyJs() {
    return gulp.src('./src/js/*.js') // Путь к JS файлам
        .pipe(terser()) // Минификация с поддержкой современного синтаксиса
        .pipe(rename({ extname: '.min.js' })) // Переименование (опционально)
        .pipe(gulp.dest('dist/script_min')) // Папка назначения
        .pipe(browser.stream()); // Обновляем браузер после изменения JS
}


// Функция для минификации HTML
function minifyHtml() {
    return gulp.src(['./src/*.html', './src/pages/*.html']) // Путь к HTML файлам
        .pipe(htmlmin({ collapseWhitespace: true })) // Минификация
        .pipe(gulp.dest('dist/html_min')); // Папка назначения
}

// Функция для запуска локального сервера
function serve(done) {
    browser.init({
        server: {
            baseDir: './dist' // Папка, которую будет обслуживать сервер
        },
        port: 2000 // Порт сервера
    });

    done();
}

// Экспорт всех функций для использования в Gulp
export {
    pages,
    build,
    watchSass,
    minifyJs,
    minifyHtml,
    serve,
    moveImages
};

export const task = gulp.parallel(minifyHtml, minifyJs, build, pages, moveImages);

// Экспорт задачи по умолчанию, которая запускает все параллельно
export default gulp.parallel(minifyHtml, minifyJs, build, pages, moveImages, watchSass, serve);