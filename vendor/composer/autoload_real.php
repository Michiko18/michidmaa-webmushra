<?php

// autoload_real.php @generated by Composer

class ComposerAutoloaderInit7bf014d2c73b52a06fd7ef6dd544b8b5
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     */
    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        require __DIR__ . '/platform_check.php';

        spl_autoload_register(array('ComposerAutoloaderInit7bf014d2c73b52a06fd7ef6dd544b8b5', 'loadClassLoader'), true, true);
        self::$loader = $loader = new \Composer\Autoload\ClassLoader(\dirname(__DIR__));
        spl_autoload_unregister(array('ComposerAutoloaderInit7bf014d2c73b52a06fd7ef6dd544b8b5', 'loadClassLoader'));

        require __DIR__ . '/autoload_static.php';
        call_user_func(\Composer\Autoload\ComposerStaticInit7bf014d2c73b52a06fd7ef6dd544b8b5::getInitializer($loader));

        $loader->register(true);

        return $loader;
    }
}
