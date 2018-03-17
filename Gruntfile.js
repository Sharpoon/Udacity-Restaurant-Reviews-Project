/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {

                    sizes: [{
                        name: '270',
                        width: 270,
                        height: 203,
                        quality: 40
                    }, {
                        name: '650',
                        width: 650,
                        height: 488,
                        quality: 40
                    }
                    ]
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img_src/',
                    dest: 'img/'
                }]
            },
            icons: {
                options: {

                    sizes: [{
                        name: '48',
                        width: 48,
                        quality: 60
                    }, {
                        name: '96',
                        width: 96,
                        quality: 60
                    }, {
                        name: '144',
                        width: 144,
                        quality: 60
                    }, {
                        name: '192',
                        width: 192,
                        quality: 60
                    }, {
                        name: '256',
                        width: 256,
                        quality: 60
                    }, {
                        name: '384',
                        width: 384,
                        quality: 60
                    }, {
                        name: '512',
                        width: 512,
                        quality: 60
                    },

                    ]
                },

                /*
                You don't need to change this part if you don't change
                the directory structure.
                */
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img_src/icons',
                    dest: 'img/icons'
                }]
            }
        },


        /* Clear out the images directory if it exists */
        clean: {
            dev: {
                src: ['img'],
            },
        },

        /* Generate the images directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: ['img']
                },
            },
        },


        /* Copy the "fixed" images that don't go through processing into the images/directory */
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: 'img_src',
                    src: '*.{gif,jpg,png}',
                    dest: 'img/'
                }]
            },
        },
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', ['clean', 'mkdir', 'copy', 'responsive_images']);

};
