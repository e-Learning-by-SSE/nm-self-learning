import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {trpc} from "@self-learning/api-client";
import {getSession, useSession} from "next-auth/react";
import {FolderSkillEditor} from "@self-learning/teaching";
import {GetServerSideProps} from "next";
import {database} from "@self-learning/database";
import {SkillFormModel, skillRepositoryCreationSchema} from "@self-learning/types";


const createNew = async (userId: string) => {
	const newRep = {
		ownerId: userId,
		name: "New Skilltree: " + Date.now(),
		description: "New Skilltree Description"
	};
	const result = await await database.skillRepository.create({
		data: newRep
	});

	console.log("New repository created", {
		repoId: result.id,
		ownerId: result.ownerId
	});
	const newRepoSlug = result.id; // route to created repo
	return {
		redirect: {
			destination: `/skills/repository/${newRepoSlug}`, // your new URL here
			permanent: false,
		},
	};
}

const getSkills = async (repoId: string) => {
	const skills = await database.skill.findMany({
		where: {repositoryId: repoId},
		select: {
			id: true,
			name: true,
			description: true,
			repositoryId: true,
			children: {select: {id: true}},
			parents: {select: {id: true}},
			repository: true
		},
	});

	const transformedSkill = skills.map(skill => {
		return {
			id: skill.id,
			name: skill.name,
			description: skill.description,
			repositoryId: skill.repositoryId,
			children: skill.children.map(child => child.id),
			parents: skill.parents.map(parent => parent.id)
		};
	});
	return transformedSkill;
}
export type SkillProps = { repoId: string, skills: SkillFormModel[] };


export const getServerSideProps: GetServerSideProps<SkillProps> = async (ctx) => {
	const repoId = ctx.query.repoSlug as string;

	const session = await getSession(ctx);

	if(!(session && session !== null && session.user && session.user.id)) {
		return {
		redirect: {
			destination: `/403`, // your new URL here
			permanent: false,
		},
	};
	}

	if (!repoId || repoId === "") return {notFound: true}


	if (repoId === "create") {
		return await createNew(session.user.id);
	}


	const transformedSkill = await getSkills(repoId);

	return {props: {repoId, skills: transformedSkill}, notFound: false};
}

export default function CreateAndViewRepository(skills: SkillProps) {

	console.log(skills)

	return (
		<div>
			<FolderSkillEditor skillProps={skills}/>
		</div>
	);
}
