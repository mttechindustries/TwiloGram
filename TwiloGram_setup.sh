~/TwiloGram $ cd
~ $ nano Twiliogram_setup.sh
~ $ rm -r Twiliogram
rm: cannot remove 'Twiliogram': No such file or directory
~ $ cd ~
~ $ ls
ABBH                Twiliogram_setup.sh  go
ABBH_Pro            TwiloGram            ipcam_discovery
Ipcam_discovery     cam_scan             requirements.txt
Ipcam_discovery.py  dirsearch            storage
README.md           downloads            tools
~ $ rm -r TwiloGram/
rm: remove write-protected regular file 'TwiloGram/.git/objects/pack/pack-7d2dac74828698779f7a1d7e94e992df8c8069a8.pack'?
rm: remove write-protected regular file 'TwiloGram/.git/objects/pack/pack-7d2dac74828698779f7a1d7e94e992df8c8069a8.rev'?
rm: remove write-protected regular file 'TwiloGram/.git/objects/pack/pack-7d2dac74828698779f7a1d7e94e992df8c8069a8.idx'?
rm: cannot remove 'TwiloGram/.git/objects/pack': Directory not empty
~ $ ls