#!/bin/python3
from os.path import isfile, isdir, join
import glob
import re
import json
import sys

def get_i18n_en_US():
	with open(join("src", "i18n", "en_US.json"), 'r') as script_hdl:
		script_content = json.load(script_hdl)
	return script_content
	
def get_i18n_keys(i18n_content):	
	i18n_keys = list(i18n_content.keys())
	i18n_keys.sort()
	return i18n_keys

def write_expected_i18n_en_US(origin_i18n, expected_i18n):
	new_i18n_us={}
	for i18n_key in expected_i18n:
		if i18n_key in origin_i18n:
			new_i18n_us[i18n_key] = origin_i18n[i18n_key]
		else:
			new_i18n_us[i18n_key] = i18n_key
	with open(join("src", "i18n", "en_US-expected_without_not_used.json"), "w") as script_hdl:
		script_hdl.write(json.dumps(new_i18n_us, indent=2))
	new_i18n_us=origin_i18n.copy()
	new_i18n_us.update({i18n_key:i18n_key for i18n_key in expected_i18n if i18n_key not in origin_i18n})
	new_i18n_us = {i18n_key: i18n_value for i18n_key, i18n_value in sorted(new_i18n_us.items(), key=lambda item: item[0])}
	with open(join("src", "i18n", "en_US-with_not_translated.json"), "w") as script_hdl:
		script_hdl.write(json.dumps(new_i18n_us, indent=2))

list_translate_sentence_regex = (
	re.compile(r'[^a-zA-Z]t\(\s*"([^"]*)"\s*\)'),
	re.compile(r"[^a-zA-Z]t\(\s*'([^']*)'\s*\)"),
	re.compile(r'<i18n-t\s+tag="[a-z]+"\s+keypath="([^"]*)"\s+>'),
	re.compile(r'<i18n-t\s+keypath="([^"]*)"\s+tag="[a-z]+"\s+>'),
	re.compile(r' t\(\s*"([^"]*)",'),
	re.compile(r'"t\(\'(.*)\'\)"'),
	)


def extract_all_sentences(dir="src/"):
	translate_sentence = set()
	for script_item in glob.glob(dir + "*"):
		if isdir(script_item) and script_item[0] != '.':
			translate_sentence.update(extract_all_sentences(script_item + '/'))
		elif isfile(script_item) and script_item.split('.')[-1] in ("vue", "ts"):
			with open(script_item, 'r') as script_hdl:
				script_content = script_hdl.read()
			for translate_sentence_regex in list_translate_sentence_regex:
				translate_sentence.update(translate_sentence_regex.findall(script_content))
	return translate_sentence

expected_i18n_keys = list(extract_all_sentences())
expected_i18n_keys.sort()
i18n_us_content = get_i18n_en_US()
keys_translated = get_i18n_keys(i18n_us_content)
write_expected_i18n_en_US(i18n_us_content, expected_i18n_keys)

print("Size of expected %d / in real US file %s" % (len(expected_i18n_keys), len(keys_translated)))
print("I18n not translated = %d"  % (len(set(expected_i18n_keys) - set(keys_translated))))
print("I18n not used = %d"  % (len(set(keys_translated) - set(expected_i18n_keys))))
sys.exit(0 if len(set(expected_i18n_keys) - set(keys_translated)) == 0 else 1)