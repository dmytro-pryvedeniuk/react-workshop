/* eslint-disable no-console */

// Core
import git from 'nodegit';
import { existsSync } from 'fs';

// Constants
import {
    GIT_ROOT,
    SYNC_REMOTE_ORIGIN_REFERENCE,
    SYNC_BRANCH_NAME,
    SYNC_REMOTE_UPSTREAM_REFERENCE,
    MASTER_REMOTE_UPSTREAM_REFERENCE,
    GIT_HTTPS_URL,
} from '../constants';

// Instruments
import { messages } from './messages';

// Helpers
import { fetchAll, connectUpstream } from './helpers';

(async () => {
    try {
        console.log(messages.get(1));
        const isRepositoryInitialized = existsSync(GIT_ROOT);

        if (!isRepositoryInitialized) {
            await (await import('./helpers/initialize-repository')).default();
        }

        const repository = await git.Repository.open(GIT_ROOT);
        const origin = await repository.getRemote('origin');
        const originUrl = origin.url().toLocaleLowerCase();
        const isSsh = originUrl.startsWith('git');
        let fixedHttpsOriginUrl = null;

        if (isSsh) {
            fixedHttpsOriginUrl = await (await import('./helpers/convert-origin-https')).default(
                repository,
                originUrl,
            );
        }
        const resolvedOriginUrl = fixedHttpsOriginUrl || originUrl;

        await fetchAll(repository);
        const allReferences = await repository.getReferenceNames(3);

        const isUpstream = resolvedOriginUrl === GIT_HTTPS_URL;

        if (isUpstream) {
            // upstream
            if (!allReferences.includes(SYNC_REMOTE_ORIGIN_REFERENCE)) {
                console.log(messages.get(2));

                return null;
            }
        } else {
            // fork
            console.log(messages.get(3));

            if (!allReferences.includes(MASTER_REMOTE_UPSTREAM_REFERENCE)) {
                await connectUpstream(repository, GIT_HTTPS_URL);
            } else {
                console.log(messages.get(7));
            }

            await fetchAll(repository);

            const upstreamReferences = await repository.getReferenceNames(3);

            if (!upstreamReferences.includes(SYNC_REMOTE_UPSTREAM_REFERENCE)) {
                console.log(messages.get(8));

                return null;
            }
        }

        console.log(messages.get(9));

        const statuses = await repository.getStatus();

        if (statuses.length) {
            await (await import('./helpers/backup')).default(repository);
        }

        await (await import('./helpers/lookup-branch-to-sync')).default(
            repository,
            isUpstream,
        );

        console.log(messages.get(10));

        await fetchAll(repository);

        await repository.mergeBranches(
            SYNC_BRANCH_NAME,
            isUpstream
                ? SYNC_REMOTE_ORIGIN_REFERENCE
                : SYNC_REMOTE_UPSTREAM_REFERENCE,
        );

        console.log(messages.get(11));
    } catch (error) {
        console.log('→ error', error);
    }
})();
