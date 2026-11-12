using System;

namespace Domain.Entities
{
    public class StepDependencyEntity
    {
        public StepDependencyEntity(Guid stepId, Guid dependsOnStepId)
        {
            StepId = stepId;
            DependsOnStepId = dependsOnStepId;
        }

        public Guid Id { get; private set; }
        public Guid StepId { get; private set; }
        public Guid DependsOnStepId { get; private set; }
        public DateTime CreatedAt { get; private set; }
    }
}