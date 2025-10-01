# phreaknic.info


## Build steps
1. edit things
2. Run `hugo server`
3. Verify things at http://localhost:1313/ look good
4. If they don't, go back to step 1

## Deploy steps
### Deploy to test.phreaknic.info
1. `git pull`
2. `hugo build -D -d ../test.phreaknic.info -b https://test.phreaknic.info --cleanDestinationDir`
3. Make changes and commit as needed

### Deploy to phreaknic.info`
1. `hugo build`
