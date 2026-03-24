with nations as (

    select * from {{ ref('stg_nation') }}

),

regions as (

    select * from {{ ref('stg_region') }}

),

final as (

    select
        -- primary key
        nations.nation_key,

        -- location attributes
        nations.nation_name,
        regions.region_key,
        regions.region_name

    from nations
    inner join regions
        on nations.region_key = regions.region_key

)

select * from final
