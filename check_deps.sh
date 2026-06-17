#!/bin/bash

ELIXIR_LIB_EXCLUDE="ueberauth_cas doctor"
VUEJS_LIB_EXCLUDE="@apollo/client mock-apollo-client @vueuse/core @unhead/vue tailwindcss @oruga-ui/oruga-next @oruga-ui/theme-oruga @types/leaflet.locatecontrol @eslint/js eslint vite vue-router typescript graphql"

let EXITVALUE=0
mix hex.outdated | grep -v "Up-to-date"

ELIXIR_ERROR=$(mix hex.outdated | grep 'Update possible' | awk '{print $1}')
if [ ! -z "$ELIXIR_ERROR" ]
then
	for lib_item in $(echo $ELIXIR_ERROR)
	do
		echo $ELIXIR_LIB_EXCLUDE | grep $lib_item > /dev/null
		if [ $? -ne 0 ]
		then
			echo "> Bad Elixir dependancies: $lib_item"
			let EXITVALUE=1
		fi
	done
fi

npm outdated
VUEJS_ERROR=$(npm outdated | grep 'mobilizon' | awk '{print $1}' )
if [ ! -z "$VUEJS_ERROR" ]
then
	for lib_item in $(echo $VUEJS_ERROR)
	do
		echo $VUEJS_LIB_EXCLUDE | grep $lib_item > /dev/null
		if [ $? -ne 0 ]
		then
			echo "> Bad VueJS dependancies: $lib_item"
			let EXITVALUE=1
		fi
	done
fi

exit $EXITVALUE
