import type {ModrinthAPI} from "../../ModrinthAPI";
import {Project} from "../../types/Project";

export enum FacetType {
    project_type = "projectType",
    categories = "categories",
    versions = "versions",
    client_side = "clientSide",
    server_side = "serverSide",
    open_source = "openSource",
    title = "title",
    author = "author",
    follows = "follows",
    project_id = "projectId",
    license = "license",
    downloads = "downloads",
    color = "color",
    created_timestamp = "createdTimestamp",
    modified_timestamp = "modifiedTimestamp",
}

export enum FacetOperation {
    "=",
    "!=",
    ">=",
    ">",
    "<=",
    "<",
}

export type FacetValue = string | number;

export const Facets: { [key in FacetType]: () => SingleFacetBuilder } = {
    [FacetType.project_type]: () =>
        new SingleFacetBuilder(FacetType.project_type),
    [FacetType.categories]: () => new SingleFacetBuilder(FacetType.categories),
    [FacetType.versions]: () => new SingleFacetBuilder(FacetType.versions),
    [FacetType.client_side]: () => new SingleFacetBuilder(FacetType.client_side),
    [FacetType.server_side]: () => new SingleFacetBuilder(FacetType.server_side),
    [FacetType.open_source]: () => new SingleFacetBuilder(FacetType.open_source),
    [FacetType.title]: () => new SingleFacetBuilder(FacetType.title),
    [FacetType.author]: () => new SingleFacetBuilder(FacetType.author),
    [FacetType.follows]: () => new SingleFacetBuilder(FacetType.follows),
    [FacetType.project_id]: () => new SingleFacetBuilder(FacetType.project_id),
    [FacetType.license]: () => new SingleFacetBuilder(FacetType.license),
    [FacetType.downloads]: () => new SingleFacetBuilder(FacetType.downloads),
    [FacetType.color]: () => new SingleFacetBuilder(FacetType.color),
    [FacetType.created_timestamp]: () =>
        new SingleFacetBuilder(FacetType.created_timestamp),
    [FacetType.modified_timestamp]: () =>
        new SingleFacetBuilder(FacetType.modified_timestamp),
};

export interface SearchOptions {
    query?: string;
    facets?: SingleFacetBuilder[] | SingleFacetBuilder;
    sort?: "relevance" | "downloads" | "follows" | "newest" | "updated";
    offset?: number;
    limit?: number;
}

class SingleFacetBuilder {
    private facetType: FacetType;
    private facetOperation?: FacetOperation;
    private facetValue?: FacetValue;
    private alternatives: string[] = [];

    constructor(facetType: FacetType) {
        this.facetType = facetType;
    }

    equals(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation["="];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    notEquals(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation["!="];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    greaterThanOrEqualsTo(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation[">="];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    greaterThan(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation[">"];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    lessThanOrEqualsTo(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation["<="];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    lessThan(value: FacetValue): SingleFacetBuilder {
        this.facetOperation = FacetOperation["<"];
        this.facetValue = value;
        this._commitFacet();
        return this;
    }

    or(...facets: SingleFacetBuilder[] | FacetValue[]) {
        facets.forEach((facet) => {
            if (facet instanceof SingleFacetBuilder) {
                this.alternatives.push(...facet.alternatives);
            } else {
                const newFacet = new SingleFacetBuilder(this.facetType);
                newFacet.facetOperation = this.facetOperation;
                newFacet.facetValue = facet;
                newFacet._commitFacet();
                this.alternatives.push(...newFacet.alternatives);
            }
        });

        return this;
    }

    private _commitFacet(): string[] {
        if (this.facetOperation === undefined || this.facetValue === undefined)
            throw new Error("Cannot commit facet without operation and value.");

        this.alternatives.push(
            `${this.facetType} ${FacetOperation[this.facetOperation]} ${
                this.facetValue
            }`
        );

        return this.alternatives;
    }

    build(): string[] {
        return this.alternatives;
    }
}

export interface SearchResults {
    hits: Project[];
    offset: number;
    limit: number;
    total_hits: number;
    getFirst?: () => Project;
    getLast?: () => Project;
}

export async function searchProjects(this: ModrinthAPI, options: SearchOptions) {
    const params = new URLSearchParams();

    if (options.facets) {
        params.set(
            "facets",
            JSON.stringify(
                Array.isArray(options.facets)
                    ? options.facets
                    : [options.facets].map((v) => v.build())
            )
        );
    }

    options.query && params.set("query", options.query);
    options.limit && params.set("limit", options.limit.toString());
    options.offset && params.set("offset", options.offset.toString());
    options.sort && params.set("sort", options.sort);

    const resp = await this._request<SearchResults>("GET", "search", {
        query: params,
    });
    return {
        ...resp,
        getFirst: () => resp.hits[0] ?? null
    }
}